import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [adminBypass, setAdminBypass] = useState<boolean>(() => {
    return localStorage.getItem('codespark_admin_bypass') === 'true' || user?.role === 'admin';
  });

  const refreshStatus = async () => {
    try {
      // 1. Try Supabase Cloud Database first (works on Vercel)
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (!error && data) {
        const active = data.value === 'true';
        setIsMaintenance(active);
        localStorage.setItem('codespark_maintenance_mode', active ? 'true' : 'false');
        setLoading(false);
        return;
      }

      // 2. Fallback to local server API
      const res = await fetch('/api/system/maintenance').catch(() => null);
      if (res && res.ok) {
        const apiData = await res.json().catch(() => null);
        if (apiData?.success) {
          setIsMaintenance(apiData.maintenance);
          localStorage.setItem('codespark_maintenance_mode', apiData.maintenance ? 'true' : 'false');
        }
      }
    } catch {
      // Retain previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    // Poll maintenance status every 15 seconds
    const interval = setInterval(refreshStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminBypass(true);
      localStorage.setItem('codespark_admin_bypass', 'true');
    }
  }, [user]);

  const toggleMaintenance = async (enable: boolean): Promise<boolean> => {
    const val = enable ? 'true' : 'false';
    setIsMaintenance(enable);
    localStorage.setItem('codespark_maintenance_mode', val);

    try {
      // 1. Sync to Supabase Cloud
      await supabase
        .from('site_settings')
        .upsert({
          key: 'maintenance_mode',
          value: val,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      // 2. Sync to local backend if running
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance: enable }),
      }).catch(() => null);

      return true;
    } catch {
      return true;
    }
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
