import { useEffect, useState } from 'react';
import { adminStats, recentActivity as defaultActivity } from '@/mocks/admin';
import { useMaintenance } from '@/context/MaintenanceContext';

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
    totalEffects: adminStats.totalEffects,
    totalUsers: adminStats.totalUsers,
    pendingReviews: adminStats.pendingReviews,
    unreadMessages: 0,
    monthlyViews: '520K'
  });
  const [activity, setActivity] = useState(defaultActivity);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStatsData(data.stats);
          if (Array.isArray(data.recentActivity) && data.recentActivity.length > 0) {
            setActivity(data.recentActivity);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
      {/* 🚀 Testing & Maintenance Mode Switch Card */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
        isMaintenance 
          ? 'bg-amber-500/10 border-amber-500/40' 
          : 'bg-background-50 border-background-300/60'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl font-bold shadow-md shrink-0 ${
              isMaintenance ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}>
              <i className={isMaintenance ? 'ri-tools-fill' : 'ri-global-line'} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground-950">
                  Platform Status: {isMaintenance ? 'Testing / Maintenance Mode' : 'Live to Public'}
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isMaintenance 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                }`}>
                  {isMaintenance ? 'ACTIVE (Private Testing)' : 'LIVE (Public)'}
                </span>
              </div>
              <p className="text-xs text-foreground-600 mt-0.5">
                {isMaintenance 
                  ? 'Public visitors see the Maintenance & Countdown screen. Only you (Admin) can browse and test effects.'
                  : 'All visitors can freely browse, copy effects, and interact with the library.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMaintenance}
            disabled={toggling}
            className={`btn h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shrink-0 transition-all ${
              isMaintenance
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
            }`}
          >
            {toggling ? (
              <i className="ri-loader-4-line animate-spin text-base" />
            ) : isMaintenance ? (
              <span className="flex items-center gap-1.5">
                <i className="ri-rocket-2-line text-base" /> Turn Site LIVE 🚀
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <i className="ri-tools-line text-base" /> Enable Maintenance Mode 🚧
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-background-300/60 bg-background-50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg border ${s.tint}`}>
                <i className={s.icon} />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground-950">{s.value}</p>
            <p className="text-[11px] sm:text-xs text-foreground-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-2xl border border-background-300/60 bg-background-50 p-5 sm:p-6 shadow-sm">
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground-950 flex items-center gap-2">
          <i className="ri-flashlight-line text-primary-500" /> Platform Management Shortcuts
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('verifications') : null}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 text-left transition-all hover:border-primary-400 hover:bg-background-100/60 shadow-sm"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-500/10 text-lg text-primary-600">
              <i className="ri-shield-check-line" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate">Review Submissions</p>
              <p className="text-[11px] text-foreground-500 truncate">{statsData.pendingReviews} awaiting action</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('official') : null}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 text-left transition-all hover:border-primary-400 hover:bg-background-100/60 shadow-sm"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-lg text-emerald-600">
              <i className="ri-add-box-line" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate">Add Official Effect</p>
              <p className="text-[11px] text-foreground-500 truncate">Publish curated code</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('users') : null}
            className="flex items-center gap-3 rounded-xl border border-background-300/60 p-4 text-left transition-all hover:border-primary-400 hover:bg-background-100/60 shadow-sm"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-lg text-purple-600">
              <i className="ri-group-line" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate">Manage Users</p>
              <p className="text-[11px] text-foreground-500 truncate">{statsData.totalUsers} registered</p>
            </div>
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="rounded-2xl border border-background-300/60 bg-background-50 p-5 sm:p-6 shadow-sm">
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground-950 flex items-center gap-2">
          <i className="ri-history-line text-primary-500" /> Recent Administrative Activity
        </h3>
        <div className="mt-4 divide-y divide-background-300/40">
          {activity.map((a) => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border shrink-0 ${actionColor[a.action] || 'text-foreground-700 bg-background-200'}`}>
                  {a.action}
                </span>
                <span className="text-foreground-900 truncate">
                  <strong>{(a as any).actor || (a as any).by || 'Admin'}</strong> {a.action} <span className="font-semibold text-primary-600">{a.target}</span>
                </span>
              </div>
              <span className="text-[11px] text-foreground-400 shrink-0">{(a as any).timestamp || (a as any).time || 'Recently'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}