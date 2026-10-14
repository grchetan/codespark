import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export interface VersionData {
  version: string;
  commit: string;
  message: string;
  buildTime: number;
  releaseDate?: string;
  timestamp?: string;
}

const CHECK_INTERVAL_MS = 30000; // Poll every 30 seconds
const AUTO_UPDATE_DELAY_SECONDS = 25; // 25s auto-update countdown

export function useLiveUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState<VersionData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_UPDATE_DELAY_SECONDS);
  const [autoUpdating, setAutoUpdating] = useState(false);

  const initialBuildTimeRef = useRef<number>(
    typeof __APP_BUILD_INFO__ !== 'undefined' && __APP_BUILD_INFO__?.buildTime
      ? __APP_BUILD_INFO__.buildTime
      : Date.now()
  );
  const initialCommitRef = useRef<string>(
    typeof __APP_BUILD_INFO__ !== 'undefined' && __APP_BUILD_INFO__?.commit
      ? __APP_BUILD_INFO__.commit
      : ''
  );

  const location = useLocation();
  const hasUpdateRef = useRef(false);
  hasUpdateRef.current = hasUpdate;

  // Clean hard reload that busts browser and worker cache
  const applyUpdate = useCallback(async () => {
    setAutoUpdating(true);
    try {
      // 1. Clear any CacheStorage caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      // 2. Unregister any service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn('Error clearing cache on update:', e);
    }

    // 3. Force clean reload to current path with cache-busting timestamp
    const url = new URL(window.location.href);
    url.searchParams.set('_v', Date.now().toString());
    window.location.replace(url.toString());
  }, []);

  const checkVersion = useCallback(async () => {
    if (autoUpdating) return;
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!res.ok) return;
      const data: VersionData = await res.json();

      // Check if server version is different from the bundled client version
      const isDifferentBuild =
        data.buildTime && data.buildTime !== initialBuildTimeRef.current;
      const isDifferentCommit =
        data.commit &&
        initialCommitRef.current &&
        data.commit !== initialCommitRef.current &&
        data.commit !== 'live' &&
        data.commit !== 'dev';

      if (isDifferentBuild || isDifferentCommit) {
        setHasUpdate(true);
        setNewVersion(data);
      }
    } catch {
      // Network offline or fetch failed, retry later silently
    }
  }, [autoUpdating]);

  // Periodic polling + check on visibility/focus
  useEffect(() => {
    // Initial check after 4 seconds
    const initialTimer = setTimeout(checkVersion, 4000);
    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    const onFocus = () => checkVersion();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkVersion]);

  // Auto-update countdown timer once update is detected (unless user clicked 'Later')
  useEffect(() => {
    if (!hasUpdate || dismissed || autoUpdating) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          applyUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasUpdate, dismissed, autoUpdating, applyUpdate]);

  // Automatic seamless update when user navigates to another page
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (hasUpdateRef.current && !autoUpdating) {
        // User changed route while an update was waiting: apply clean update now!
        applyUpdate();
      }
    }
  }, [location.pathname, applyUpdate, autoUpdating]);

  return {
    hasUpdate,
    newVersion,
    dismissed,
    setDismissed,
    countdown,
    autoUpdating,
    applyUpdate,
  };
}
