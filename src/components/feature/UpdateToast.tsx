import React, { useState } from 'react';
import { useLiveUpdate } from '@/hooks/useLiveUpdate';

export default function UpdateToast() {
  const {
    hasUpdate,
    newVersion,
    dismissed,
    setDismissed,
    countdown,
    autoUpdating,
    applyUpdate,
  } = useLiveUpdate();

  const [minimized, setMinimized] = useState(false);

  if (!hasUpdate || !newVersion) {
    return null;
  }

  // If minimized by the user, show an unobtrusive floating pill
  if (minimized || dismissed) {
    return (
      <aside
        aria-label="New update alert"
        className="fixed bottom-4 right-4 z-[9999] animate-fade-in"
      >
        <button
          type="button"
          onClick={() => {
            setMinimized(false);
            setDismissed(false);
          }}
          className="group flex items-center gap-2.5 rounded-full border border-primary-500/40 bg-[#171A20] px-4 py-2 text-xs font-semibold text-[#F5F1EA] shadow-2xl backdrop-blur-md transition-all hover:border-primary-500 hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
          </span>
          <span>Update Ready ({newVersion.version})</span>
          <span className="rounded-md bg-primary-500/20 px-1.5 py-0.5 text-[10px] text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
            Apply ⚡
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="New version available notification"
      className="fixed bottom-4 right-4 z-[9999] w-full max-w-sm px-3 sm:px-0 animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(245,241,234,0.18)] bg-[#171A20] p-4 text-[#F5F1EA] shadow-2xl backdrop-blur-xl">
        {/* Subtle orange accent glow at top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-80" />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#F5F1EA]">
                  New Version Deployed
                </span>
                <span className="rounded bg-primary-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-primary-400">
                  {newVersion.version}
                </span>
              </div>
              {newVersion.commit && (
                <span className="text-[10px] font-mono text-[#918A80]">
                  commit #{newVersion.commit}
                </span>
              )}
            </div>
          </div>

          {/* Minimize / Dismiss button */}
          <button
            type="button"
            onClick={() => setMinimized(true)}
            title="Minimize"
            className="text-[#918A80] hover:text-[#F5F1EA] p-1 rounded-md transition-colors"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        {/* Commit summary / release message */}
        <div className="mt-2.5 rounded-lg bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.08)] p-2.5">
          <p className="text-xs text-[#C8C2B9] leading-snug font-mono line-clamp-2">
            {newVersion.message || 'Latest feature updates, bug fixes, and performance enhancements.'}
          </p>
        </div>

        {/* Auto update countdown bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-[#918A80] mb-1">
            <span>Auto-updating in</span>
            <span className="font-mono font-bold text-primary-400">{countdown}s</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-primary-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, (countdown / 25) * 100))}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyUpdate()}
            disabled={autoUpdating}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-400 active:scale-[0.98] disabled:opacity-60"
          >
            {autoUpdating ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <i className="ri-flashlight-fill text-sm text-amber-300" />
                <span>Update Now ⚡</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              setMinimized(true);
            }}
            disabled={autoUpdating}
            className="rounded-lg border border-[rgba(245,241,234,0.18)] bg-transparent px-3 py-2 text-xs font-semibold text-[#BDB6AC] transition-colors hover:bg-white/5 hover:text-[#F5F1EA]"
          >
            Later
          </button>
        </div>
      </div>
    </aside>
  );
}
