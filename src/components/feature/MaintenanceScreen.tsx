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
  const [activeTab, setActiveTab] = useState<'pipeline' | 'specs' | 'upcoming'>('pipeline');

  // Admin Bypass Modal State (accessible discreetly from footer)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('chetan@codespark.dev');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Live Simulated Pipeline Progress Animation
  const [progress, setProgress] = useState(92);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 98 ? 92 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 px-4 py-6 sm:py-10 select-none relative overflow-x-hidden ${
        isDark ? 'bg-[#0F1115] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#0F1115]'
      }`}
    >
      {/* Precision Geometric Grid Background with Subtle Scanning Laser */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(to right, #FAF6EE 1px, transparent 1px), linear-gradient(to bottom, #FAF6EE 1px, transparent 1px)'
            : 'linear-gradient(to right, #0F1115 1px, transparent 1px), linear-gradient(to bottom, #0F1115 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Clean Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between relative z-10">
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
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-ping" />
            System Upgrade v2.0
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

      {/* Main Center Content */}
      <main className="mx-auto my-auto flex w-full max-w-3xl flex-col items-center text-center px-2 py-8 sm:py-12 relative z-10">
        {/* Animated Precision Circuit Icon */}
        <div className="relative mb-6">
          <div
            className={`relative grid h-16 w-16 place-items-center rounded-2xl border shadow-sm ${
              isDark
                ? 'border-[#FAF6EE]/15 bg-[#17191E] text-primary-500'
                : 'border-[#0F1115]/15 bg-[#FAF6EE] text-primary-500'
            }`}
          >
            <i className="ri-cpu-line text-2xl animate-pulse" />
          </div>
          {/* Subtle spinning outer orbit dots */}
          <div className="absolute -inset-1 rounded-2xl border border-dashed border-primary-500/30 animate-spin" style={{ animationDuration: '14s' }} />
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2">
          Engineering In Progress
        </span>

        <h1
          className={`font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight ${
            isDark ? 'text-[#FAF6EE]' : 'text-[#0F1115]'
          }`}
        >
          Upgrading the Engine to the Next Level
        </h1>

        <p
          className={`mt-3 sm:mt-4 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed ${
            isDark ? 'text-[#FAF6EE]/65' : 'text-[#0F1115]/65'
          }`}
        >
          Deploying verified physics micro-interactions, zero-static live compilers, and cloud infrastructure. We'll be back live shortly.
        </p>

        {/* 💻 INTERACTIVE UPGRADE PIPELINE HUD */}
        <div
          className={`mt-8 w-full rounded-2xl border text-left overflow-hidden shadow-sm transition-all ${
            isDark ? 'bg-[#14171D] border-[#FAF6EE]/10' : 'bg-[#FAF7F2] border-[#0F1115]/10'
          }`}
        >
          {/* Terminal Top Bar */}
          <div
            className={`flex items-center justify-between border-b px-4 py-2.5 text-xs font-mono ${
              isDark ? 'border-[#FAF6EE]/10 bg-[#17191E]' : 'border-[#0F1115]/10 bg-[#EDE7D9]/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[11px] font-semibold opacity-70">engine-upgrade-daemon.sh</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('pipeline')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  activeTab === 'pipeline'
                    ? 'bg-primary-500 text-white'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Pipeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  activeTab === 'specs'
                    ? 'bg-primary-500 text-white'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                System Specs
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-5 font-mono text-xs space-y-3">
            {activeTab === 'pipeline' ? (
              <>
                {/* Task 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-emerald-500" />
                      <span>Zero-Dependency Micro-Interaction Physics</span>
                    </span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#1E222A]' : 'bg-[#E2DC CE]'}`}>
                    <div className="h-full bg-emerald-500 w-full rounded-full" />
                  </div>
                </div>

                {/* Task 2 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-emerald-500" />
                      <span>Dynamic Code Sandbox & Multi-Device Simulators</span>
                    </span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#1E222A]' : 'bg-[#E2DC CE]'}`}>
                    <div className="h-full bg-emerald-500 w-full rounded-full" />
                  </div>
                </div>

                {/* Task 3 (Active Pulsing) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2">
                      <i className="ri-loader-4-line text-primary-500 animate-spin" />
                      <span>Cloud Database & Verified Registry Sync</span>
                    </span>
                    <span className="text-primary-500 font-bold">{progress}%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#1E222A]' : 'bg-[#E2DC CE]'}`}>
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#17191E] border-[#FAF6EE]/10' : 'bg-white border-[#0F1115]/10'}`}>
                  <p className="opacity-50 text-[10px]">FRAMEWORK</p>
                  <p className="font-bold mt-0.5">React 18 + Vite</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#17191E] border-[#FAF6EE]/10' : 'bg-white border-[#0F1115]/10'}`}>
                  <p className="opacity-50 text-[10px]">CLOUD DB</p>
                  <p className="font-bold mt-0.5">PostgreSQL Cloud</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#17191E] border-[#FAF6EE]/10' : 'bg-white border-[#0F1115]/10'}`}>
                  <p className="opacity-50 text-[10px]">LICENSE</p>
                  <p className="font-bold mt-0.5 text-primary-500">100% Free MIT</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Notification Form */}
        <div className="mt-7 w-full max-w-md">
          {subscribed ? (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-semibold border ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
              }`}
            >
              <i className="ri-checkbox-circle-fill text-base" />
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
                className={`h-11 flex-1 rounded-xl px-4 text-xs sm:text-sm outline-none border transition-colors ${
                  isDark
                    ? 'bg-[#14171D] border-[#FAF6EE]/15 text-[#FAF6EE] placeholder:text-[#FAF6EE]/40 focus:border-primary-500'
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
      </main>

      {/* Clean Footer with Discreet Staff Portal */}
      <footer
        className={`mx-auto flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t pt-6 relative z-10 ${
          isDark ? 'border-[#FAF6EE]/10 text-[#FAF6EE]/40' : 'border-[#0F1115]/10 text-[#0F1115]/40'
        }`}
      >
        <p>© 2026 CodeSpark Platform. Architecture by Chetan Prajapat.</p>
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="hover:text-primary-500 transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
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
