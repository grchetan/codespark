import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Overview from './components/Overview';
import Verifications from './components/Verifications';
import OfficialEffects from './components/OfficialEffects';
import Users from './components/Users';
import Requirements from './components/Requirements';
import Messages from './components/Messages';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleTabs, hasPermission } from '@/lib/permissions';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function AdminPage() {
  const { user, isAuthenticated, isStaff, isSuperAdmin, loading } = useAuth();
  const [params, setParams] = useSearchParams();

  const userRole = user?.role || 'member';
  const allowedTabs = getAccessibleTabs(userRole);
  const initialTab = params.get('tab') || 'overview';

  const [tab, setTab] = useState(() => {
    return allowedTabs.includes(initialTab) ? initialTab : (allowedTabs[0] || 'overview');
  });

  // Keep tab in sync with permissions when user logs in/changes
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
      <div className="min-h-screen bg-background-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-500/10 text-2xl text-primary-500 mb-4 animate-pulse">
            <i className="ri-shield-keyhole-line text-3xl" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground-950">
            Verifying Admin Authorization
          </h2>
          <p className="text-xs text-foreground-500 mt-1 max-w-sm">
            Authenticating security clearance and database permissions...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Strict Security Check: Only Staff (Super Admin, Admin, Moderator) can access
  const hasAccess = isAuthenticated && isStaff && hasPermission(userRole, 'dashboard.view');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-background-300/80 bg-background-50 p-8 text-center shadow-2xl space-y-5 animate-fade-in">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/10 text-3xl text-rose-500 border border-rose-500/20">
              <i className="ri-lock-2-fill" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 border border-rose-500/25 mb-2">
                403 Access Denied
              </span>
              <h1 className="font-display text-2xl font-bold text-foreground-950">
                Admin Clearance Required
              </h1>
              <p className="text-xs text-foreground-600 mt-2 leading-relaxed">
                This area is strictly restricted. Only verified platform administrators and moderators appointed by the platform owner can access the Control Center.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to="/login?redirect=/admin"
                className="btn btn-primary h-10 w-full text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <i className="ri-user-line" /> Sign In with Authorized Account
              </Link>
              <Link
                to="/effects"
                className="btn btn-secondary h-10 w-full text-xs font-semibold flex items-center justify-center gap-2"
              >
                <i className="ri-arrow-left-line" /> Return to Public Library
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
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