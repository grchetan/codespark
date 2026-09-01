import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Overview from './components/Overview';
import Verifications from './components/Verifications';
import OfficialEffects from './components/OfficialEffects';
import Users from './components/Users';
import Requirements from './components/Requirements';
import Messages from './components/Messages';
import AccessDenied from '@/pages/AccessDenied';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleTabs, hasPermission } from '@/lib/permissions';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function AdminPage() {
  const { user, isAuthenticated, isStaff, loading } = useAuth();
  const [params, setParams] = useSearchParams();

  const userRole = user?.role || 'member';
  const allowedTabs = getAccessibleTabs(userRole);
  const initialTab = params.get('tab') || 'overview';

  const [tab, setTab] = useState(() => {
    return allowedTabs.includes(initialTab) ? initialTab : (allowedTabs[0] || 'overview');
  });

  // Keep tab in sync with permissions when user logs in or role updates
  useEffect(() => {
    if (user && allowedTabs.length > 0 && !allowedTabs.includes(tab)) {
      setTab(allowedTabs[0]);
    }
  }, [user, allowedTabs, tab]);

  const handleTabChange = (next: string) => {
    if (!allowedTabs.includes(next)) return;
    setTab(next);
    if (next === 'overview') params.delete('tab');
    else params.set('tab', next);
    setParams(params, { replace: true });
  };

  // 1. Loading state while verifying credentials
  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col justify-between w-full max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 px-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-500/10 text-2xl text-primary-500 mb-4 animate-pulse">
            <i className="ri-shield-keyhole-line text-3xl" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground-950">
            Checking Permissions...
          </h2>
          <p className="text-xs text-foreground-500 mt-1 max-w-sm">
            Authenticating security clearance and verifying platform roles...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Strict Security Check: Only Staff (Super Admin, Admin, Moderator) can access
  const hasAccess = isAuthenticated && isStaff && hasPermission(userRole, 'dashboard.view');

  if (!hasAccess) {
    return <AccessDenied requiredRole="moderator" />;
  }

  // 3. Authorized Staff: Render Dynamic Control Center based on exact permissions
  return (
    <AdminLayout activeTab={tab} onTabChange={handleTabChange}>
      {tab === 'overview' && <Overview onNavigateTab={handleTabChange} />}
      {tab === 'verifications' && <Verifications />}
      {tab === 'official' && hasPermission(userRole, 'effects.manage') && <OfficialEffects />}
      {tab === 'users' && hasPermission(userRole, 'users.view') && <Users />}
      {tab === 'requirements' && hasPermission(userRole, 'requirements.manage') && <Requirements />}
      {tab === 'banned' && <Users bannedOnly />}
      {tab === 'messages' && <Messages />}
    </AdminLayout>
  );
}