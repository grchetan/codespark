import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// ==============================================================================
// AUTH VISUAL MEDIA COMPONENT (Easily replaceable with CodeSpark image / GIF)
// ==============================================================================
export function AuthVisual() {
  return (
    <div className="w-full h-full min-h-[420px] lg:min-h-[580px] flex items-center justify-center relative overflow-hidden rounded-3xl select-none">
      {/* 
        REPLACE IMAGE / GIF HERE:
        You can replace this img src with your animated GIF, WebP, PNG, or video asset:
        e.g., <img src="/effects-login.gif" alt="CodeSpark Effects" className="w-full h-full object-cover rounded-3xl" />
      */}
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121316] via-[#1a1c23] to-[#0d0e12] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        {/* Ambient Subtle Glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-primary-500/20 via-rose-500/20 to-amber-500/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Visual Media Showcase Placeholder */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-md space-y-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 border border-white/20 text-3xl text-primary-400 shadow-xl backdrop-blur-md">
            <i className="ri-sparkling-2-fill" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold tracking-widest text-primary-400 uppercase block">
              CodeSpark Effects Media
            </span>
            <p className="text-sm text-white/60 font-sans">
              Drop your custom effect animation / GIF here.
            </p>
          </div>
        </div>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>
    </div>
  );
}

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
      // Supabase Auth Server Sign In
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
        <div className="container-x w-full px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Reveal>
            {/* Full-Width 2-Column Layout: Left Dedicated Visual Area + Right Login Card */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-14 items-center">
              
              {/* ================================================================= */}
              {/* LEFT COLUMN: FULL-WIDTH DEDICATED VISUAL / GIF MEDIA AREA         */}
              {/* (NO Card, NO Border, NO Stats, NO Badges - Pure Media Asset Slot) */}
              {/* ================================================================= */}
              <div className="hidden lg:block w-full h-full">
                <AuthVisual />
              </div>

              {/* ================================================================= */}
              {/* RIGHT COLUMN: CODESPARK AUTHENTICATION CARD (ZERO LAYOUT SHIFT)   */}
              {/* ================================================================= */}
              <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-[430px] rounded-3xl border border-background-300/80 bg-background-50 p-6 sm:p-8 shadow-md">
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
                  <div className="min-h-[44px] mb-3 flex items-center transition-all duration-200">
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

            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}