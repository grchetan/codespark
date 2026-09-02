import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { isAuthenticated, user, isStaff, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (isStaff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/effects', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, isStaff, redirectParam, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Supabase Auth Server Sign In (Single Source of Truth)
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authErr) {
        setError('Invalid email or password. Please check your credentials.');
        return;
      }

      if (data?.session && data?.user) {
        setSuccess('Authentication successful! Redirecting...');
        setTimeout(() => {
          if (redirectParam) {
            navigate(redirectParam, { replace: true });
          } else {
            navigate('/effects', { replace: true });
          }
        }, 500);
      }
    } catch {
      setError('Invalid email or password. Please check your credentials.');
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
          redirectTo: `${window.location.origin}/effects`,
        },
      });
      if (authError) {
        setError(authError.message || 'OAuth login failed.');
      }
    } catch {
      setError('Failed to initialize OAuth connection.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50 flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 w-full max-w-full overflow-x-hidden flex-1 flex items-center justify-center">
        <div className="container-x w-full px-3 sm:px-6 max-w-5xl">
          <Reveal>
            {/* Balanced 2-Column Responsive Layout (Visual Showcase on Left, Stable Card on Right) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* ================================================================= */}
              {/* LEFT COLUMN: EFFECT VISUAL / ANIMATED GIF SHOWCASE PLACEHOLDER    */}
              {/* ================================================================= */}
              <div className="hidden lg:flex flex-col justify-between rounded-3xl border border-background-300/80 bg-gradient-to-br from-background-100/90 via-background-50 to-background-200/50 p-8 shadow-sm relative overflow-hidden min-h-[530px]">
                {/* Top Badge & Tag */}
                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-600 border border-primary-500/20">
                    <i className="ri-sparkling-fill text-xs" />
                    <span>Interactive Library</span>
                  </span>
                  <span className="text-[11px] font-bold text-foreground-500 bg-background-200/80 px-2.5 py-1 rounded-lg">
                    v1.4.0
                  </span>
                </div>

                {/* Main Visual Image / GIF Showcase Container (Easily Replaceable with Animated GIF) */}
                <div className="relative my-6 flex items-center justify-center flex-1">
                  {/* Decorative Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/15 via-orange-500/15 to-amber-500/15 rounded-3xl blur-xl opacity-70" />

                  {/* Visual Box Container */}
                  <div className="relative w-full max-w-sm rounded-2xl border border-background-300/90 bg-background-50/95 backdrop-blur-md p-5 shadow-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary-500/50">
                    {/* Animated Stage / GIF Slot */}
                    <div className="relative h-44 w-full rounded-xl bg-gradient-to-br from-[#0f1115] to-[#1a1c23] border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-inner p-4">
                      {/* Ambient Animated Blob */}
                      <div className="absolute h-24 w-24 rounded-full bg-gradient-to-r from-[#FF4D2E] to-[#FF8A00] blur-xl opacity-40 animate-pulse" />
                      
                      {/* Graphic Icon & Subtitle */}
                      <div className="relative z-10 flex flex-col items-center gap-2.5">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/20 text-2xl text-white shadow-md">
                          <i className="ri-code-s-slash-line text-primary-400" />
                        </span>
                        <div className="text-center">
                          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase block">
                            Live Effects Engine
                          </span>
                          <span className="text-[10px] text-white/60 block mt-0.5 font-mono">
                            GPU-Accelerated Micro-interactions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description Below Visual */}
                    <div className="mt-3.5 text-left w-full">
                      <h4 className="font-display text-sm font-bold text-foreground-950">
                        Interactive Micro-interactions
                      </h4>
                      <p className="text-[11px] text-foreground-500 mt-0.5 leading-relaxed">
                        Copy-paste ready React & vanilla CSS components built for modern web developers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Footer */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-background-300/60 z-10 text-center">
                  <div>
                    <span className="block font-display text-base font-bold text-foreground-950">100%</span>
                    <span className="text-[10px] text-foreground-500 font-medium">Free & Open</span>
                  </div>
                  <div>
                    <span className="block font-display text-base font-bold text-foreground-950">Zero</span>
                    <span className="text-[10px] text-foreground-500 font-medium">Lock-in</span>
                  </div>
                  <div>
                    <span className="block font-display text-base font-bold text-foreground-950">React + CSS</span>
                    <span className="text-[10px] text-foreground-500 font-medium">Modern Stacks</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* RIGHT COLUMN: STABLE AUTHENTICATION CARD (ZERO LAYOUT SHIFT)      */}
              {/* ================================================================= */}
              <div className="w-full max-w-[440px] mx-auto rounded-3xl border border-background-300/80 bg-background-50 p-6 sm:p-8 shadow-md">
                {/* Header Icon & Title */}
                <div className="mb-4 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-foreground-950 text-xl text-foreground-950 shadow-sm">
                    <i className="ri-sparkling-2-fill text-primary-500" />
                  </span>
                  <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-xs text-foreground-500">
                    Sign in to your CodeSpark account to continue.
                  </p>
                </div>

                {/* Zero-Layout-Shift Notification / Error Slot (Stable height prevents card jumping) */}
                <div className="min-h-[46px] mb-3 flex items-center transition-all duration-200">
                  {error ? (
                    <div className="w-full flex items-start gap-2.5 rounded-xl bg-primary-500/10 p-2.5 text-xs text-primary-600 border border-primary-500/25 animate-fade-in leading-snug">
                      <i className="ri-error-warning-fill text-sm shrink-0 text-primary-500 mt-0.5" />
                      <span className="flex-1 break-words">{error}</span>
                    </div>
                  ) : success ? (
                    <div className="w-full flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-600 border border-emerald-500/25 animate-fade-in leading-snug">
                      <i className="ri-checkbox-circle-fill text-sm shrink-0 text-emerald-500 mt-0.5" />
                      <span className="flex-1 break-words">{success}</span>
                    </div>
                  ) : (
                    <div className="w-full h-0 opacity-0 pointer-events-none" />
                  )}
                </div>

                {/* OAuth Buttons (Google & GitHub) */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={Boolean(oauthLoading) || loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-background-300 bg-background-100/70 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-xs transition-all hover:bg-background-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <i className="ri-google-fill text-base text-rose-500" />
                    <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={Boolean(oauthLoading) || loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-background-300 bg-background-100/70 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-xs transition-all hover:bg-background-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <i className="ri-github-fill text-base text-foreground-950" />
                    <span>{oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-4 text-center text-xs text-foreground-400">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-background-300/60" />
                  </div>
                  <span className="relative bg-background-50 px-2 uppercase text-[10px] font-bold tracking-wider">
                    Or with email
                  </span>
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-foreground-800 block mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      disabled={loading}
                      className="input text-xs sm:text-sm h-10 w-full disabled:opacity-60 rounded-xl"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-foreground-800">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-primary-600 hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="input text-xs sm:text-sm h-10 pr-10 w-full disabled:opacity-60 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-sm cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-foreground-600 select-none">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded border-background-400 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Remember me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-base" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <i className="ri-arrow-right-line" />
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Footer Link */}
                <p className="mt-5 text-center text-xs text-foreground-500">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-600 hover:underline">
                    Create free account
                  </Link>
                </p>
              </div>

            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}