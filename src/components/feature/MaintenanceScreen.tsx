import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMaintenance } from '@/context/MaintenanceContext';

export default function MaintenanceScreen() {
  const { login } = useAuth();
  const { enableBypass } = useMaintenance();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('codespark_theme') === 'dark';
  });

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Admin Bypass Modal State (accessible discreetly from footer)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('chetan@codespark.dev');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('codespark_theme', next ? 'dark' : 'light');
  };

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
        setAdminError(data.error || 'Access denied. Super Admin credentials required.');
      }
    } catch {
      setAdminError('Network error. Make sure backend connection is active.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 px-4 py-8 sm:py-10 select-none ${
        isDark ? 'bg-[#0F1115] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#0F1115]'
      }`}
    >
      {/* Top Clean Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        {/* Exact Official Brand Logo */}
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-8 w-8 place-items-center rounded-full border text-sm transition-colors ${
              isDark ? 'border-[#FAF6EE]/20 bg-[#17191E]' : 'border-[#0F1115]/20 bg-[#FAF6EE]'
            }`}
          >
            <i className="ri-sparkling-2-fill text-primary-500" />
          </span>
          <span
            className={`font-display text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-[#FAF6EE]' : 'text-[#0F1115]'
            }`}
          >
            CODESPARK
          </span>
        </div>

        {/* Right Actions: Clean Status Pill & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              isDark
                ? 'bg-[#17191E] text-[#FAF6EE]/80 border-[#FAF6EE]/10'
                : 'bg-[#EDE7D9] text-[#0F1115]/80 border-[#0F1115]/10'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
            Scheduled Upgrade
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`grid h-8 w-8 place-items-center rounded-full border transition-all ${
              isDark
                ? 'border-[#FAF6EE]/15 bg-[#17191E] text-[#FAF6EE] hover:bg-[#20232A]'
                : 'border-[#0F1115]/15 bg-[#FAF6EE] text-[#0F1115] hover:bg-[#EDE7D9]'
            }`}
          >
            <i className={isDark ? 'ri-sun-line text-amber-400 text-sm' : 'ri-moon-line text-sm'} />
          </button>
        </div>
      </header>

      {/* Main Center Content (Clean Minimalist UI) */}
      <main className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center text-center px-4 py-12">
        {/* Clean Center Icon Badge */}
        <div
          className={`mb-6 grid h-16 w-16 place-items-center rounded-2xl border shadow-sm ${
            isDark
              ? 'border-[#FAF6EE]/10 bg-[#17191E] text-primary-500'
              : 'border-[#0F1115]/10 bg-[#FAF6EE] text-primary-500'
          }`}
        >
          <i className="ri-sparkling-2-fill text-2xl" />
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">
          Platform Maintenance & Upgrade
        </span>

        <h1
          className={`font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight ${
            isDark ? 'text-[#FAF6EE]' : 'text-[#0F1115]'
          }`}
        >
          Upgrading the Engine to the Next Level
        </h1>

        <p
          className={`mt-4 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed ${
            isDark ? 'text-[#FAF6EE]/60' : 'text-[#0F1115]/60'
          }`}
        >
          We're currently deploying high-performance interactive physics components, verified creator tools, and cloud optimizations. CodeSpark will be back online shortly.
        </p>

        {/* Email Notification Form */}
        <div className="mt-8 w-full max-w-md">
          {subscribed ? (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-semibold border ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
              }`}
            >
              <i className="ri-checkbox-circle-fill text-base" />
              <span>You're on the list! We'll notify you as soon as we go live.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for launch alert..."
                required
                className={`h-11 flex-1 rounded-xl px-4 text-xs sm:text-sm outline-none border transition-colors ${
                  isDark
                    ? 'bg-[#17191E] border-[#FAF6EE]/15 text-[#FAF6EE] placeholder:text-[#FAF6EE]/40 focus:border-primary-500'
                    : 'bg-[#FAF6EE] border-[#0F1115]/20 text-[#0F1115] placeholder:text-[#0F1115]/40 focus:border-primary-500'
                }`}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn btn-primary h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm"
              >
                {subscribing ? (
                  <i className="ri-loader-4-line animate-spin text-sm" />
                ) : (
                  <i className="ri-notification-3-line text-sm" />
                )}
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* Clean Highlights Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 border font-medium ${
              isDark
                ? 'bg-[#17191E] border-[#FAF6EE]/10 text-[#FAF6EE]/70'
                : 'bg-[#EDE7D9]/60 border-[#0F1115]/10 text-[#0F1115]/70'
            }`}
          >
            <i className="ri-check-line text-emerald-500" /> 18+ Live Physics Effects
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 border font-medium ${
              isDark
                ? 'bg-[#17191E] border-[#FAF6EE]/10 text-[#FAF6EE]/70'
                : 'bg-[#EDE7D9]/60 border-[#0F1115]/10 text-[#0F1115]/70'
            }`}
          >
            <i className="ri-check-line text-emerald-500" /> Verified Creator Badges
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 border font-medium ${
              isDark
                ? 'bg-[#17191E] border-[#FAF6EE]/10 text-[#FAF6EE]/70'
                : 'bg-[#EDE7D9]/60 border-[#0F1115]/10 text-[#0F1115]/70'
            }`}
          >
            <i className="ri-check-line text-emerald-500" /> 100% Free & MIT Licensed
          </span>
        </div>
      </main>

      {/* Clean Footer with Discreet Admin Portal */}
      <footer
        className={`mx-auto flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t pt-6 ${
          isDark ? 'border-[#FAF6EE]/10 text-[#FAF6EE]/40' : 'border-[#0F1115]/10 text-[#0F1115]/40'
        }`}
      >
        <p>© 2026 CodeSpark Platform. Architecture by Chetan Prajapat.</p>
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="hover:text-primary-500 transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
        >
          <i className="ri-lock-line" /> Staff Portal
        </button>
      </footer>

      {/* Discreet Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${
              isDark ? 'bg-[#17191E] border-[#FAF6EE]/15 text-[#FAF6EE]' : 'bg-[#FAF6EE] border-[#0F1115]/20 text-[#0F1115]'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isDark ? 'border-[#FAF6EE]/10' : 'border-[#0F1115]/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-current text-xs">
                  <i className="ri-sparkling-2-fill text-primary-500" />
                </span>
                <h3 className="font-display text-sm font-bold">Admin Portal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="opacity-60 hover:opacity-100 text-base"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <p className="text-xs opacity-70">
              Sign in with Super Admin credentials to bypass maintenance mode.
            </p>

            {adminError && (
              <div className="rounded-xl bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-500 border border-rose-500/30">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminBypass} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={`input text-xs h-9 ${
                    isDark ? 'bg-[#0F1115] border-[#FAF6EE]/20 text-[#FAF6EE]' : 'bg-white border-[#0F1115]/20'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={`input text-xs h-9 ${
                    isDark ? 'bg-[#0F1115] border-[#FAF6EE]/20 text-[#FAF6EE]' : 'bg-white border-[#0F1115]/20'
                  }`}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="btn btn-secondary h-9 text-xs flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="btn btn-primary h-9 text-xs font-bold flex-1"
                >
                  {adminLoading ? 'Signing in...' : 'Enter Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
