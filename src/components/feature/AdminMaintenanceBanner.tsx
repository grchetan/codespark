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
      aria-label="Testing Mode Active"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] max-w-[95vw] sm:max-w-xl animate-fade-in select-none pointer-events-auto"
    >
      {minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#0F1115]/95 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-xl hover:border-amber-400 transition-all"
        >
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>Testing Mode Active</span>
          <i className="ri-arrow-up-s-line text-sm" />
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-[#0F1115]/95 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-500 text-white text-xs font-bold shrink-0 shadow-sm">
              <i className="ri-tools-fill" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-amber-400 truncate">Testing Mode Active</p>
              <p className="text-[11px] text-white/60 truncate hidden sm:block">Public visitors see maintenance page</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin"
              className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Admin Panel
            </Link>

            <button
              type="button"
              onClick={handleTurnOff}
              disabled={updating}
              className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {updating ? 'Publishing...' : 'Turn Site LIVE 🚀'}
            </button>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              title="Minimize Bar"
              className="grid h-6 w-6 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <i className="ri-arrow-down-s-line text-base" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
