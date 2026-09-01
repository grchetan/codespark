import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import { useAuth, isMasterAdmin } from '@/context/AuthContext';
import { useMaintenance } from '@/context/MaintenanceContext';

import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { isMaintenance } = useMaintenance();
  const [counts, setCounts] = useState({
    pending: 0,
    banned: 0,
    messages: 0
  });

  useEffect(() => {
    Promise.all([
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'banned'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
    ]).then(([subRes, userRes, inqRes]) => {
      setCounts({
        pending: subRes.count || 0,
        banned: userRes.count || 0,
        messages: inqRes.count || 0,
      });
    }).catch(() => {});
  }, [activeTab]);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: 'ri-dashboard-3-line' },
    { key: 'verifications', label: 'Verifications', icon: 'ri-shield-check-line', badge: counts.pending },
    { key: 'official', label: 'Official Effects', icon: 'ri-code-box-line' },
    { key: 'users', label: 'Users & Roles', icon: 'ri-group-line' },
    { key: 'requirements', label: 'Requirements', icon: 'ri-list-check-3' },
    { key: 'banned', label: 'Banned & Mod', icon: 'ri-user-forbid-line', badge: counts.banned },
    { key: 'messages', label: 'Inquiries', icon: 'ri-mail-line', badge: counts.messages },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 w-full max-w-full overflow-x-hidden">
        <div className="container-x w-full">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-background-300/50 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                <p className="eyebrow">Admin Console</p>
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground-950">
                Control Center
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-foreground-500">
                Manage submissions, official effects, users, and platform inquiries.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                isMaintenance 
                  ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30' 
                  : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
              }`}>
                <span className={`h-2 w-2 rounded-full ${isMaintenance ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                {isMaintenance ? 'Testing Mode (Private)' : 'Live to Public'}
              </span>
              <Link to="/effects" className="btn btn-secondary h-10 px-4 text-xs font-semibold whitespace-nowrap">
                <i className="ri-arrow-left-line" /> Back to site
              </Link>
            </div>
          </div>

          {/* Mobile Tab Scrollbar */}
          <div className="mb-6 lg:hidden overflow-x-auto pb-1 code-scroll">
            <div className="flex gap-1.5 min-w-max p-1 bg-background-100/80 rounded-2xl border border-background-300/60">
              {navItems.map((n) => (
                <button
                  key={n.key}
                  onClick={() => onTabChange(n.key)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    activeTab === n.key
                      ? 'bg-foreground-950 text-background-50 shadow-md'
                      : 'text-foreground-600 hover:bg-background-200 hover:text-foreground-950'
                  }`}
                >
                  <i className={n.icon} />
                  <span>{n.label}</span>
                  {Boolean(n.badge) && (
                    <span
                      className={`grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-bold ${
                        activeTab === n.key ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {n.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Sidebar (Desktop) + Content View */}
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] w-full min-w-0">
            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-28 lg:h-fit space-y-4">
              <div className="flex flex-col gap-1 rounded-2xl border border-background-300/60 bg-background-50 p-2 shadow-sm">
                {navItems.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => onTabChange(n.key)}
                    className={`relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      activeTab === n.key
                        ? 'bg-foreground-950 text-background-50 shadow-sm'
                        : 'text-foreground-600 hover:bg-background-200 hover:text-foreground-950'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <i className={`text-base ${n.icon} ${activeTab === n.key ? 'text-primary-400' : 'text-foreground-500'}`} />
                      <span>{n.label}</span>
                    </span>
                    {Boolean(n.badge) && (
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                          activeTab === n.key ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'
                        }`}
                      >
                        {n.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Admin Profile Box - Authenticated User */}
              {user && (
                <div className="rounded-2xl border border-background-300/60 bg-background-100/70 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        isMasterAdmin(user.email)
                          ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat'
                          : user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || user.email)}`
                      }
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover border border-background-300 bg-background-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground-950 truncate">
                        {isMasterAdmin(user.email) ? 'Chetan Prajapat' : user.name}
                      </p>
                      <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
                        {isMasterAdmin(user.email) ? 'Super Admin (Owner)' : user.role === 'admin' ? 'Administrator' : 'Moderator'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-background-300/50 space-y-2">
                    <Link
                      to="/effects"
                      className="flex items-center gap-2 text-xs font-medium text-foreground-600 hover:text-foreground-950 transition-colors"
                    >
                      <i className="ri-eye-line text-sm" /> View Public Library
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        window.location.href = '/login';
                      }}
                      className="flex w-full items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors text-left"
                    >
                      <i className="ri-logout-box-r-line text-sm" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </aside>

            {/* Dynamic Active Tab Content */}
            <div className="min-w-0 w-full overflow-x-hidden">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}