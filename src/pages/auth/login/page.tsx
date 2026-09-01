import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();

    // 1. Instant Master Admin Login (Reliable on Vercel & localhost)
    if (
      (cleanEmail === 'chetan@codespark.dev' || cleanEmail === 'admin@codespark.dev' || cleanEmail === 'admin@effekt.dev') &&
      password === 'Admin@123'
    ) {
      const adminUser = {
        id: 'u_chetan',
        name: 'Chetan Prajapat',
        email: cleanEmail,
        role: 'admin' as const,
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat',
        effects_count: 18,
      };
      login('token_admin_chetan_codespark', adminUser);
      setSuccess('Welcome back, Chetan Prajapat! Redirecting...');
      setTimeout(() => {
        navigate('/admin');
      }, 700);
      setLoading(false);
      return;
    }

    // 2. Try Backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.success && data.token) {
          login(data.token, data.user);
          setSuccess('Welcome back! Redirecting...');
          setTimeout(() => {
            navigate(data.user?.role === 'admin' ? '/admin' : '/effects');
          }, 800);
          return;
        }
      }

      setError('Invalid credentials. Please check your email and password.');
    } catch {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/effects',
        },
      });
      if (authError) {
        setError(authError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize OAuth.');
    } finally {
      setOauthLoading(null);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 w-full max-w-full overflow-x-hidden">
        <div className="container-x flex justify-center">
          <Reveal>
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-foreground-950 text-2xl text-foreground-950">
                  <i className="ri-sparkling-2-fill text-primary-500" />
                </span>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground-950">Welcome back</h1>
                <p className="mt-2 text-sm text-foreground-500">Sign in to your CodeSpark account to continue.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary-500/10 p-3.5 text-sm text-primary-600 border border-primary-500/30">
                  <i className="ri-error-warning-line text-lg" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-sm text-emerald-600 border border-emerald-500/30">
                  <i className="ri-checkbox-circle-line text-lg" />
                  <span>{success}</span>
                </div>
              )}

              {/* Demo Account Shortcut Pill */}
              <div className="mb-5 rounded-xl border border-background-300/60 bg-background-100/70 p-3.5 text-xs text-foreground-600 space-y-2">
                <p className="font-semibold uppercase tracking-wider text-foreground-700">Quick Test Credentials:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('chetan@codespark.dev', 'Admin@123')}
                    className="chip text-[11px] bg-background-50 hover:border-primary-500"
                  >
                    <i className="ri-shield-keyhole-line text-primary-500" /> Admin: chetan@codespark.dev
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@codespark.dev', 'Admin@123')}
                    className="chip text-[11px] bg-background-50 hover:border-primary-500"
                  >
                    <i className="ri-shield-user-line text-primary-500" /> admin@codespark.dev
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('mara@codespark.dev', 'Admin@123')}
                    className="chip text-[11px] bg-background-50 hover:border-accent-500"
                  >
                    <i className="ri-user-smile-line text-accent-600" /> Creator: mara@codespark.dev
                  </button>
                </div>
              </div>

              {/* OAuth Buttons (Google & GitHub) */}
              <div className="mb-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={Boolean(oauthLoading)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300/80 bg-background-50 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-sm transition-all hover:bg-background-200"
                >
                  <i className="ri-google-fill text-base text-rose-500" />
                  <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={Boolean(oauthLoading)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300/80 bg-background-50 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-sm transition-all hover:bg-background-200"
                >
                  <i className="ri-github-fill text-base text-foreground-950" />
                  <span>{oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                </button>
              </div>

              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-background-300/60" /></div>
                <span className="relative bg-background-50 px-3 text-xs font-medium uppercase tracking-wider text-foreground-400">or with email</span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5 rounded-2xl border border-background-300/50 bg-background-50 p-6 md:p-8 shadow-sm">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="label !mb-0">Password</label>
                    <Link to="/contact" className="text-xs font-medium text-primary-500 hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      className="input pr-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-500 hover:text-foreground-950"
                      aria-label="Toggle password"
                    >
                      <i className={show ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} />
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-background-400 text-primary-500 focus:ring-primary-400"
                  />
                  Remember me
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary h-12 w-full text-sm font-semibold"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-lg" /> Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <i className="ri-arrow-right-line text-lg" />
                    </>
                  )}
                </button>

                <p className="pt-1 text-center text-sm text-foreground-500">
                  Don't have an account? <Link to="/signup" className="font-semibold text-primary-500 hover:underline">Sign up</Link>
                </p>
              </form>

              <p className="mt-6 text-center text-xs text-foreground-400">
                Need help? <Link to="/contact" className="text-foreground-500 hover:underline">Contact support</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}