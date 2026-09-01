import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface MaintenanceContextType {
  isMaintenance: boolean;
  loading: boolean;
  adminBypass: boolean;
  toggleMaintenance: (enable: boolean) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  enableBypass: () => void;
  disableBypass: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState<boolean>(() => {
    return localStorage.getItem('codespark_maintenance_mode') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [adminBypass, setAdminBypass] = useState<boolean>(() => {
    return localStorage.getItem('codespark_admin_bypass') === 'true' || user?.role === 'admin';
  });

  const refreshStatus = async () => {
    try {
      const res = await fetch('/api/system/maintenance');
      const data = await res.json();
      if (data.success) {
        setIsMaintenance(data.maintenance);
        localStorage.setItem('codespark_maintenance_mode', data.maintenance ? 'true' : 'false');
      }
    } catch {
      // Retain previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    // Poll maintenance status every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminBypass(true);
      localStorage.setItem('codespark_admin_bypass', 'true');
    }
  }, [user]);

  const toggleMaintenance = async (enable: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance: enable }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMaintenance(enable);
        localStorage.setItem('codespark_maintenance_mode', enable ? 'true' : 'false');
        return true;
      }
    } catch {}
    return false;
  };

  const enableBypass = () => {
    setAdminBypass(true);
    localStorage.setItem('codespark_admin_bypass', 'true');
  };

  const disableBypass = () => {
    setAdminBypass(false);
    localStorage.removeItem('codespark_admin_bypass');
  };

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenance,
        loading,
        adminBypass: adminBypass || user?.role === 'admin',
        toggleMaintenance,
        refreshStatus,
        enableBypass,
        disableBypass,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}
