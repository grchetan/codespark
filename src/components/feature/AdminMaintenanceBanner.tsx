import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMaintenance } from '@/context/MaintenanceContext';

export default function AdminMaintenanceBanner() {
  const { isMaintenance, adminBypass, toggleMaintenance } = useMaintenance();
  const [updating, setUpdating] = useState(false);

  if (!isMaintenance || !adminBypass) {
    return null;
  }

  const handleTurnOff = async () => {
    setUpdating(true);
    await toggleMaintenance(false);
    setUpdating(false);
  };

  return (
    <aside aria-label="Testing Mode Active" className="sticky top-0 z-50 flex w-full flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 backdrop-blur-md text-foreground-950 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
        <span>
          <strong className="font-bold text-amber-600 dark:text-amber-400">Testing / Maintenance Mode ACTIVE:</strong> Public visitors cannot see the website. You are viewing via Admin Bypass.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/admin"
          className="rounded-lg bg-background-50 px-2.5 py-1 text-xs font-bold text-foreground-900 border border-background-300 hover:bg-background-200 transition-colors"
        >
          Admin Console
        </Link>
        <button
          type="button"
          onClick={handleTurnOff}
          disabled={updating}
          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {updating ? 'Publishing...' : 'Turn Site LIVE 🚀'}
        </button>
      </div>
    </aside>
  );
}
