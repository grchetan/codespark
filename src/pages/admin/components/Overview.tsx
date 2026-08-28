import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminStats, recentActivity as defaultActivity } from '@/mocks/admin';

const actionColor: Record<string, string> = {
  approved: 'text-emerald-700 bg-emerald-100 border-emerald-300',
  rejected: 'text-primary-700 bg-primary-100 border-primary-300',
  banned: 'text-rose-700 bg-rose-100 border-rose-300',
  published: 'text-blue-700 bg-blue-100 border-blue-300',
  submitted: 'text-amber-700 bg-amber-100 border-amber-300',
  flagged: 'text-purple-700 bg-purple-100 border-purple-300',
};

export default function Overview({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const [statsData, setStatsData] = useState({
    totalEffects: adminStats.totalEffects,
    totalUsers: adminStats.totalUsers,
    pendingReviews: adminStats.pendingReviews,
    unreadMessages: 0,
    monthlyViews: '520K'
  });
  const [activity, setActivity] = useState(defaultActivity);
  const [loading, setLoading] = useState(true);

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

  const stats = [
    { label: 'Total Effects', value: statsData.totalEffects, icon: 'ri-code-box-line', tint: 'text-primary-600 bg-primary-500/10 border-primary-500/20' },
    { label: 'Total Users', value: statsData.totalUsers, icon: 'ri-user-3-line', tint: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Reviews', value: statsData.pendingReviews, icon: 'ri-time-line', tint: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    { label: 'Platform Inquiries', value: statsData.unreadMessages || 0, icon: 'ri-mail-line', tint: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
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
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-lg text-blue-600">
              <i className="ri-user-settings-line" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate">User Roles & Access</p>
              <p className="text-[11px] text-foreground-500 truncate">{statsData.totalUsers} registered users</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="rounded-2xl border border-background-300/60 bg-background-50 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-background-200 pb-3">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground-950 flex items-center gap-2">
            <i className="ri-history-line text-primary-500" /> Recent System Activity
          </h3>
          <span className="text-xs text-foreground-500">Live logs</span>
        </div>

        <div className="mt-3 divide-y divide-background-200/60">
          {activity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3 transition-colors hover:bg-background-100/50 rounded-lg px-2">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold border ${actionColor[a.action] || 'bg-background-200 text-foreground-600'}`}>
                <i className={a.action === 'banned' ? 'ri-forbid-line' : a.action === 'approved' ? 'ri-check-line' : a.action === 'rejected' ? 'ri-close-line' : 'ri-sparkling-line'} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm text-foreground-950">
                  <span className="font-bold capitalize">{a.action}</span> <span className="text-foreground-700 font-semibold">{a.target}</span>
                </p>
                <p className="text-[11px] text-foreground-500">by {a.by} · {a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}