import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  avatar?: string;
  status?: string;
  effects_count?: number;
}

export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  
  // 1. Check environment variable (private & gitignored)
  const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdmins.includes(clean)) {
    return true;
  }

  // 2. Default official domain admins
  const defaultAdmins = ['admin@codespark.dev', 'chetan@codespark.dev'];
  return defaultAdmins.includes(clean);
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  signup: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('codespark_user') || localStorage.getItem('effekt_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isMasterAdmin(parsed.email)) {
          parsed.role = 'admin';
          parsed.name = 'Chetan Prajapat';
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

  // 1. Supabase OAuth & Session Listener (1-Click Google Login)
  useEffect(() => {
    // Check active Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userEmail = (session.user.email || '').toLowerCase();
        let isAdminUser = isMasterAdmin(userEmail);

        // Also check role in Supabase users table
        if (!isAdminUser) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('email', userEmail)
            .maybeSingle();
          if (dbUser?.role === 'admin') {
            isAdminUser = true;
          }
        }

        const authUser: User = {
          id: session.user.id,
          name: isAdminUser ? 'Chetan Prajapat' : (session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0]),
          email: userEmail,
          role: isAdminUser ? 'admin' : 'member',
          avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userEmail)}`,
          effects_count: isAdminUser ? 18 : 0,
        };

        setUser(authUser);
        setToken(session.access_token);
        localStorage.setItem('codespark_user', JSON.stringify(authUser));
        localStorage.setItem('codespark_token', session.access_token);
        if (isAdminUser) {
          localStorage.setItem('codespark_admin_bypass', 'true');
        }
      }
      setLoading(false);
    });

    // Listen for live OAuth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = (session.user.email || '').toLowerCase();
        let isAdminUser = isMasterAdmin(userEmail);

        if (!isAdminUser) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('email', userEmail)
            .maybeSingle();
          if (dbUser?.role === 'admin') {
            isAdminUser = true;
          }
        }

        const authUser: User = {
          id: session.user.id,
          name: isAdminUser ? 'Chetan Prajapat' : (session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0]),
          email: userEmail,
          role: isAdminUser ? 'admin' : 'member',
          avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userEmail)}`,
          effects_count: isAdminUser ? 18 : 0,
        };

        setUser(authUser);
        setToken(session.access_token);
        localStorage.setItem('codespark_user', JSON.stringify(authUser));
        localStorage.setItem('codespark_token', session.access_token);
        if (isAdminUser) {
          localStorage.setItem('codespark_admin_bypass', 'true');
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Token Verification fallback for local session
  useEffect(() => {
    if (token && !user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            if (isMasterAdmin(data.user.email)) {
              data.user.role = 'admin';
              data.user.name = 'Chetan Prajapat';
            }
            setUser(data.user);
            localStorage.setItem('codespark_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    if (isMasterAdmin(newUser.email)) {
      newUser.role = 'admin';
      newUser.name = 'Chetan Prajapat';
      localStorage.setItem('codespark_admin_bypass', 'true');
    }
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('codespark_token', newToken);
    localStorage.setItem('codespark_user', JSON.stringify(newUser));
  };

  const signup = (newToken: string, newUser: User) => {
    login(newToken, newUser);
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem('codespark_token');
    localStorage.removeItem('codespark_user');
    localStorage.removeItem('codespark_admin_bypass');
    localStorage.removeItem('effekt_token');
    localStorage.removeItem('effekt_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || isMasterAdmin(user?.email),
        loading,
        login,
        signup,
        logout,
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
