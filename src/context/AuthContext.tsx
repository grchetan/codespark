import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  type UserRole,
  type PermissionKey,
  isSuperAdminOwner,
  hasPermission as checkPermission,
} from '@/lib/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: string;
  effects_count?: number;
}

// Backwards-compatible helper
export function isMasterAdmin(email?: string | null): boolean {
  return isSuperAdminOwner(email);
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isStaff: boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  loading: boolean;
  isLoggingOut: boolean;
  login: (token: string, user: User) => Promise<void>;
  signup: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('codespark_user') || localStorage.getItem('effekt_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'chetanprajapat340@gmail.com') {
          parsed.role = 'superadmin';
          if (!parsed.name || parsed.name === 'Anonymous User') {
            parsed.name = 'Chetan Prajapat';
          }
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('codespark_token') || localStorage.getItem('effekt_token') || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Synchronize authenticated user profile with Supabase Cloud DB
  const syncProfileFromDB = async (email: string, fallbackUser: User): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (!error && data) {
        const isOwner = isSuperAdminOwner(data.email, data.role);
        const resolvedRole: UserRole = isOwner
          ? 'superadmin'
          : (['superadmin', 'admin', 'moderator', 'member'].includes(data.role) ? data.role : 'member');

        const resolvedUser: User = {
          id: data.id || fallbackUser.id,
          name: data.name || fallbackUser.name || (data.email === 'chetanprajapat340@gmail.com' ? 'Chetan Prajapat' : data.email.split('@')[0]),
          email: data.email,
          role: resolvedRole,
          avatar: data.avatar || fallbackUser.avatar,
          status: data.status || 'active',
          effects_count: data.effects_count || fallbackUser.effects_count || 0,
        };

        return resolvedUser;
      }
    } catch {}

    return fallbackUser;
  };

  const refreshUserProfile = async () => {
    if (!user?.email) return;
    const updated = await syncProfileFromDB(user.email, user);
    setUser(updated);
    localStorage.setItem('codespark_user', JSON.stringify(updated));
  };

  // Helper to purge all auth keys from storage
  const purgeStorage = () => {
    localStorage.removeItem('codespark_token');
    localStorage.removeItem('codespark_user');
    localStorage.removeItem('codespark_admin_bypass');
    localStorage.removeItem('effekt_token');
    localStorage.removeItem('effekt_user');
  };

  // Supabase Auth listener
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          const userEmail = (session.user.email || '').toLowerCase();
          const isOwner = isSuperAdminOwner(userEmail);

          const baseUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || (userEmail === 'chetanprajapat340@gmail.com' ? 'Chetan Prajapat' : userEmail.split('@')[0]),
            email: userEmail,
            role: isOwner ? 'superadmin' : 'member',
            avatar:
              session.user.user_metadata?.avatar_url ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userEmail)}`,
            effects_count: isOwner ? 18 : 0,
          };

          const fullUser = await syncProfileFromDB(userEmail, baseUser);

          if (isMounted) {
            setUser(fullUser);
            setToken(session.access_token);
            localStorage.setItem('codespark_user', JSON.stringify(fullUser));
            localStorage.setItem('codespark_token', session.access_token);
            if (isOwner || fullUser.role === 'admin' || fullUser.role === 'moderator') {
              localStorage.setItem('codespark_admin_bypass', 'true');
            }
          }
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        purgeStorage();
      } else if (session?.user) {
        const userEmail = (session.user.email || '').toLowerCase();
        const isOwner = isSuperAdminOwner(userEmail);

        const baseUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || (userEmail === 'chetanprajapat340@gmail.com' ? 'Chetan Prajapat' : userEmail.split('@')[0]),
          email: userEmail,
          role: isOwner ? 'superadmin' : 'member',
          avatar:
            session.user.user_metadata?.avatar_url ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userEmail)}`,
          effects_count: isOwner ? 18 : 0,
        };

        const fullUser = await syncProfileFromDB(userEmail, baseUser);

        if (isMounted) {
          setUser(fullUser);
          setToken(session.access_token);
          localStorage.setItem('codespark_user', JSON.stringify(fullUser));
          localStorage.setItem('codespark_token', session.access_token);
          if (isOwner || fullUser.role === 'admin' || fullUser.role === 'moderator') {
            localStorage.setItem('codespark_admin_bypass', 'true');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (newToken: string, newUser: User) => {
    let finalUser = { ...newUser };
    if (newUser.email === 'chetanprajapat340@gmail.com') {
      finalUser.role = 'superadmin';
      if (!finalUser.name || finalUser.name === 'Anonymous User') {
        finalUser.name = 'Chetan Prajapat';
      }
      localStorage.setItem('codespark_admin_bypass', 'true');
    } else {
      // Sync from DB for accurate role verification
      finalUser = await syncProfileFromDB(newUser.email, finalUser);
      if (['superadmin', 'admin', 'moderator'].includes(finalUser.role)) {
        localStorage.setItem('codespark_admin_bypass', 'true');
      }
    }

    setToken(newToken);
    setUser(finalUser);
    localStorage.setItem('codespark_token', newToken);
    localStorage.setItem('codespark_user', JSON.stringify(finalUser));
  };

  const signup = async (newToken: string, newUser: User) => {
    await login(newToken, newUser);
  };

  const logout = async (): Promise<void> => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Terminate Supabase Auth session
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    } finally {
      // 2. Clear state and storage unconditionally
      setToken(null);
      setUser(null);
      purgeStorage();
      setIsLoggingOut(false);
    }
  };

  const isSuperAdmin = Boolean(
    user && (user.role === 'superadmin' || user.email === 'chetanprajapat340@gmail.com')
  );

  const isAdmin = Boolean(
    isSuperAdmin || (user && user.role === 'admin')
  );

  const isModerator = Boolean(
    isAdmin || (user && user.role === 'moderator')
  );

  const isStaff = Boolean(
    isSuperAdmin || (user && ['superadmin', 'admin', 'moderator'].includes(user.role))
  );

  const hasPerm = (permission: PermissionKey): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return checkPermission(user.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isSuperAdmin,
        isAdmin,
        isModerator,
        isStaff,
        hasPermission: hasPerm,
        loading,
        isLoggingOut,
        login,
        signup,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
