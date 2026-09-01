import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMaintenance } from '@/context/MaintenanceContext';

export default function AdminMaintenanceBanner() {
  const { isMaintenance, adminBypass, toggleMaintenance } = useMaintenance();
  const [updating, setUpdating] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (!isMaintenance || !adminBypass) {
    return null;
  }

  const handleTurnOff = async () => {
    setUpdating(true);
    await toggleMaintenance(false);
    setUpdating(false);
  };

  return (
    <aside
      aria-label="Maintenance Gateway Status"
      className="fixed bottom-5 right-5 z-[9999] select-none pointer-events-auto animate-fade-in"
    >
      {minimized ? (
        /* Minimized Capsule Pill */
        <button
          type="button"
          onClick={() => setMinimized(false)}
          title="Open Admin Gateway Controls"
          className="group flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-neutral-950/90 px-3.5 py-2 text-xs font-semibold text-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl hover:border-amber-400 hover:text-white transition-all active:scale-95"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-[11px] font-medium tracking-wide">Testing Mode</span>
          <i className="ri-expand-diagonal-line text-xs text-neutral-400 group-hover:text-white transition-colors" />
        </button>
      ) : (
        /* Expanded Floating HUD Card */
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/90 p-2 pl-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl text-xs text-neutral-200">
          {/* Status Indicator & Text */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-neutral-100 text-[11px] tracking-wide flex items-center gap-1.5">
                <span>Staging Pipeline</span>
                <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-400 border border-amber-500/25">
                  Bypass Active
                </span>
              </p>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/admin"
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-white/5 px-2.5 text-[11px] font-medium text-neutral-300 hover:bg-white/15 hover:text-white transition-colors"
            >
              <i className="ri-shield-keyhole-line text-xs text-neutral-400" />
              <span>Console</span>
            </Link>

            <button
              type="button"
              onClick={handleTurnOff}
              disabled={updating}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-xs" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <i className="ri-broadcast-line text-xs" />
                  <span>Go Live</span>
                </>
              )}
            </button>

            {/* Minimize button */}
            <button
              type="button"
              onClick={() => setMinimized(true)}
              title="Minimize HUD"
              className="grid h-6 w-6 place-items-center rounded-md text-neutral-500 hover:bg-white/10 hover:text-neutral-300 transition-colors"
            >
              <i className="ri-subtract-line text-sm" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
