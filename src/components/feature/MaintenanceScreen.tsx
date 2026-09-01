import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMaintenance } from '@/context/MaintenanceContext';

export default function MaintenanceScreen() {
  const { login } = useAuth();
  const { enableBypass } = useMaintenance();

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Admin Bypass Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('chetan@codespark.dev');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubscribed(true);
    } catch {} finally {
      setSubscribing(false);
    }
  };

  const handleAdminBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user?.role === 'admin') {
        login(data.token, data.user);
        enableBypass();
        setShowAdminModal(false);
        window.location.reload();
      } else {
        setAdminError(data.error || 'Access denied. Only Super Admins can bypass maintenance mode.');
      }
    } catch {
      setAdminError('Network error. Check backend connection.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-background-950 text-foreground-50 px-4 py-8 sm:py-12 overflow-hidden selection:bg-primary-500 selection:text-white">
      {/* Background Animated Grid & Glow Blobs */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(250, 246, 238, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />

      {/* Top Header */}
      <header className="relative z-10 flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-500 text-lg font-bold text-white shadow-lg shadow-primary-500/30">
            ⚡
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">CodeSpark</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Testing / Maintenance Mode
          </span>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-background-800 bg-background-900/80 px-3 py-1.5 text-xs font-semibold text-foreground-300 hover:border-primary-500 hover:text-white transition-all shadow-sm"
          >
            <i className="ri-shield-keyhole-line text-primary-400" />
            <span className="hidden sm:inline">Admin Bypass</span>
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 my-auto flex flex-col items-center text-center max-w-2xl px-2 py-8">
        {/* Animated Icon */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary-500/30 blur-2xl animate-pulse" />
          <div className="relative grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-3xl border border-primary-500/40 bg-background-900 text-3xl sm:text-4xl text-primary-500 shadow-2xl">
            <i className="ri-tools-line animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>
        </div>

        <span className="rounded-full bg-primary-500/10 px-3.5 py-1 text-xs font-bold text-primary-400 border border-primary-500/20 uppercase tracking-widest mb-3">
          Scheduled System Upgrade
        </span>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Upgrading the Engine to the Next Level
        </h1>

        <p className="mt-4 text-sm sm:text-base text-foreground-300 max-w-lg leading-relaxed">
          We're deploying high-performance interactive physics components, verified creator tools, and cloud optimizations. CodeSpark will be fully live shortly.
        </p>

        {/* Notify Form */}
        <div className="mt-8 w-full max-w-md">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400 border border-emerald-500/30">
              <i className="ri-checkbox-circle-fill text-lg" />
              <span>You're on the list! We'll notify you the moment we launch.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for launch alert..."
                required
                className="input bg-background-900 border-background-800 text-white placeholder:text-foreground-500 h-12 rounded-xl text-sm flex-1 focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn btn-primary h-12 px-6 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded-xl shadow-lg shadow-primary-500/25"
              >
                {subscribing ? <i className="ri-loader-4-line animate-spin text-base" /> : <i className="ri-notification-3-line" />}
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* Features preview pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-foreground-400">
          <span className="flex items-center gap-1 rounded-full bg-background-900/80 px-3 py-1 border border-background-800">
            <i className="ri-check-line text-emerald-400" /> 18+ Live Physics Effects
          </span>
          <span className="flex items-center gap-1 rounded-full bg-background-900/80 px-3 py-1 border border-background-800">
            <i className="ri-check-line text-emerald-400" /> Verified Creator Badges
          </span>
          <span className="flex items-center gap-1 rounded-full bg-background-900/80 px-3 py-1 border border-background-800">
            <i className="ri-check-line text-emerald-400" /> Zero Static Images
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground-500 border-t border-background-900 pt-6">
        <p>© 2026 CodeSpark Platform. Architecture by Chetan Prajapat.</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="hover:text-primary-400 transition-colors flex items-center gap-1"
          >
            <i className="ri-admin-line" /> Staff / Admin Login
          </button>
        </div>
      </footer>

      {/* ADMIN BYPASS MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-900 p-6 shadow-2xl border border-background-800 space-y-4">
            <div className="flex items-center justify-between border-b border-background-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-500 text-white text-xs font-bold">
                  ⚡
                </span>
                <h3 className="font-display text-base font-bold text-white">Admin Bypass Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-foreground-400 hover:text-white text-lg"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <p className="text-xs text-foreground-400">
              Enter Super Admin credentials to bypass the maintenance screen and preview/edit the platform live.
            </p>

            {adminError && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/30 flex items-center gap-2">
                <i className="ri-error-warning-line text-base shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminBypass} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-300 block mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input bg-background-950 border-background-800 text-white text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-300 block mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input bg-background-950 border-background-800 text-white text-xs h-10"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="btn btn-ghost h-10 text-xs flex-1 text-foreground-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="btn btn-primary h-10 text-xs font-bold uppercase tracking-wider flex-1"
                >
                  {adminLoading ? 'Verifying...' : 'Bypass & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
