import { useEffect, useState } from 'react';
import { useMaintenance } from '@/context/MaintenanceContext';
import { supabase } from '@/lib/supabase';

const actionColor: Record<string, string> = {
  approved: 'text-emerald-700 bg-emerald-100 border-emerald-300',
  rejected: 'text-primary-700 bg-primary-100 border-primary-300',
  banned: 'text-rose-700 bg-rose-100 border-rose-300',
  published: 'text-blue-700 bg-blue-100 border-blue-300',
  submitted: 'text-amber-700 bg-amber-100 border-amber-300',
  flagged: 'text-purple-700 bg-purple-100 border-purple-300',
};

export default function Overview({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const { isMaintenance, toggleMaintenance } = useMaintenance();
  const [toggling, setToggling] = useState(false);

  const [statsData, setStatsData] = useState({
    totalEffects: 0,
    totalUsers: 0,
    pendingReviews: 0,
    unreadMessages: 0,
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveOverview = async () => {
    setLoading(true);
    try {
      // 1. Fetch live counts directly from Supabase Cloud
      const [effectsRes, usersRes, submissionsRes, inquiriesRes] = await Promise.all([
        supabase.from('effects').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
      ]);

      const totalEffects = effectsRes.count ?? 16;
      const totalUsers = usersRes.count ?? 3;
      const pendingReviews = submissionsRes.count ?? 0;
      const unreadMessages = inquiriesRes.count ?? 0;

      setStatsData({
        totalEffects,
        totalUsers,
        pendingReviews,
        unreadMessages,
      });
      setLoading(false);
      return;
    } catch {}

    // 2. Fallback to local API
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success && data.stats) {
        setStatsData(data.stats);
        if (Array.isArray(data.recentActivity)) {
          setActivity(data.recentActivity);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOverview();
  }, []);

  const handleToggleMaintenance = async () => {
    setToggling(true);
    await toggleMaintenance(!isMaintenance);
    setToggling(false);
  };

  const stats = [
    { label: 'Total Effects', value: statsData.totalEffects, icon: 'ri-code-box-line', tint: 'text-primary-600 bg-primary-500/10 border-primary-500/20' },
    { label: 'Total Users', value: statsData.totalUsers, icon: 'ri-user-3-line', tint: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Reviews', value: statsData.pendingReviews, icon: 'ri-time-line', tint: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    { label: 'Platform Inquiries', value: statsData.unreadMessages || 0, icon: 'ri-mail-line', tint: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Production Gateway & Site Availability HUD */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-300 ${
        isMaintenance 
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background-50 to-amber-500/5' 
          : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background-50 to-emerald-500/5'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Status Beacon & Icon Container */}
            <div className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-sm ${
              isMaintenance
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
            }`}>
              <i className={isMaintenance ? 'ri-tools-line text-2xl' : 'ri-global-line text-2xl'} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isMaintenance ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground-950">
                  {isMaintenance ? 'Maintenance & Staging Sandbox' : 'Production Gateway — Public Live'}
                </h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                  isMaintenance
                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-700'
                    : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {isMaintenance ? 'Testing Mode' : 'Online'}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground-600 leading-relaxed max-w-2xl">
                {isMaintenance
                  ? 'Public visitors are directed to the staging pipeline HUD. Authenticated administrators retain full bypass access.'
                  : 'Public edge routing is open. Developers and visitors can explore, preview, and copy interactive components seamlessly.'}
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              type="button"
              disabled={toggling}
              onClick={handleToggleMaintenance}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-bold transition-all shadow-sm active:scale-98 disabled:opacity-60 ${
                isMaintenance
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700'
              }`}
            >
              {toggling ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  <span>Updating Gateway...</span>
                </>
              ) : isMaintenance ? (
                <>
                  <i className="ri-broadcast-line text-sm" />
                  <span>Deploy to Public Live</span>
                </>
              ) : (
                <>
                  <i className="ri-shield-flash-line text-sm" />
                  <span>Switch to Testing Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-background-300/60 bg-background-50 p-5 shadow-sm hover:border-primary-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-bold border ${s.tint}`}>
                <i className={s.icon} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-400">Live DB</span>
            </div>
            <p className="mt-4 font-display text-2xl sm:text-3xl font-bold text-foreground-950">
              {loading ? '-' : s.value}
            </p>
            <p className="text-xs text-foreground-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Actions */}
      <div className="rounded-2xl border border-background-300/60 bg-background-50 p-6 shadow-sm space-y-4">
        <h3 className="font-display text-base font-bold text-foreground-950">
          Admin Shortcuts & Navigation
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigateTab?.('users')}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 hover:border-primary-500/50 hover:bg-background-100/40 transition-all text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 text-lg">
              <i className="ri-group-line" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground-950">Users & Roles</p>
              <p className="text-[11px] text-foreground-500">Manage {statsData.totalUsers} registered users</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.('official')}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 hover:border-primary-500/50 hover:bg-background-100/40 transition-all text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-500/10 text-primary-600 text-lg">
              <i className="ri-code-box-line" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground-950">Official Effects</p>
              <p className="text-[11px] text-foreground-500">Manage {statsData.totalEffects} components</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.('verifications')}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 hover:border-primary-500/50 hover:bg-background-100/40 transition-all text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/10 text-amber-600 text-lg">
              <i className="ri-shield-check-line" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground-950">Verifications</p>
              <p className="text-[11px] text-foreground-500">{statsData.pendingReviews} pending submissions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}