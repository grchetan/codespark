import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const terms = [
  { icon: 'ri-mail-check-line', text: 'Email verification included' },
  { icon: 'ri-user-star-line', text: 'Public creator profile' },
  { icon: 'ri-lock-line', text: 'Your data stays yours' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isStaff, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(isStaff ? '/admin' : '/effects', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, isStaff, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agree) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Supabase Auth Server Sign Up (Single Source of Truth)
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
          },
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already exists') ||
          authError.message.toLowerCase().includes('user already exists')
        ) {
          setError('An account with this email already exists. Please sign in or reset your password.');
        } else {
          setError(authError.message || 'Registration failed. Please try again.');
        }
        return;
      }

      // 2. Security Check: Supabase returns identities: [] when email already exists and email confirmations are active
      if (data?.user?.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Please sign in or reset your password.');
        return;
      }

      if (data?.user) {
        // Safe profile creation (ALWAYS enforces role = 'member')
        try {
          await supabase.from('users').insert({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            role: 'member',
            status: 'active',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
            effects_count: 0,
            created_at: new Date().toISOString(),
          });
        } catch {
          // Table triggers on auth.users will handle insertion if RLS prevents client direct insert
        }

        if (data.session) {
          setSuccess('Account created successfully! Welcome to CodeSpark.');
          setTimeout(() => {
            navigate('/effects', { replace: true });
          }, 800);
        } else {
          setSuccess('Account created! If email confirmation is required, please check your inbox to verify your email.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        }
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
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
        setError(authError.message || 'OAuth registration failed.');
      }
    } catch {
      setError('Failed to initialize OAuth.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-32 sm:pt-36 lg:pt-44 pb-24 w-full max-w-full overflow-x-hidden">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="hidden lg:block">
              <p className="eyebrow">Join CodeSpark</p>
              <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-foreground-950 leading-tight">
                Publish effects.<br />Grow your craft.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground-500">
                Create an account to submit effects, save your favorites, follow creators and get featured in the library.
              </p>
              <div className="mt-8 space-y-4">
                {terms.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-background-300/50 text-lg text-primary-500">
                      <i className={t.icon} />
                    </span>
                    <p className="text-sm font-medium text-foreground-950">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="w-full max-w-[480px] mx-auto rounded-3xl border border-background-300/80 bg-background-50 p-6 sm:p-8 shadow-md">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
                Create account
              </h2>
              <p className="mt-1 text-xs text-foreground-500 mb-5">
                Join the interactive frontend creator community.
              </p>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-primary-500/10 p-3.5 text-xs text-primary-600 border border-primary-500/25 animate-fade-in">
                  <i className="ri-error-warning-fill text-base shrink-0 text-primary-500 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-600 border border-emerald-500/25 animate-fade-in">
                  <i className="ri-checkbox-circle-fill text-base shrink-0 text-emerald-500 mt-0.5" />
                  <span className="leading-snug">{success}</span>
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('google')}
                  disabled={Boolean(oauthLoading) || loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300 bg-background-100/70 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-xs transition-all hover:bg-background-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <i className="ri-google-fill text-base text-rose-500" />
                  <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('github')}
                  disabled={Boolean(oauthLoading) || loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300 bg-background-100/70 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-xs transition-all hover:bg-background-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <i className="ri-github-fill text-base text-foreground-950" />
                  <span>{oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                </button>
              </div>

              <div className="relative mb-4 text-center text-xs text-foreground-400">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-background-300/60" />
                </div>
                <span className="relative bg-background-50 px-2 uppercase text-[10px] font-bold tracking-wider">
                  Or with email
                </span>
              </div>

              <form onSubmit={onSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    Full name
                  </label>
                  <input
                    className="input text-xs sm:text-sm h-10 w-full disabled:opacity-60 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="input text-xs sm:text-sm h-10 w-full disabled:opacity-60 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      className="input text-xs sm:text-sm h-10 pr-10 w-full disabled:opacity-60 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-sm cursor-pointer"
                      aria-label="Toggle password"
                    >
                      <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={show ? 'text' : 'password'}
                    className="input text-xs sm:text-sm h-10 w-full disabled:opacity-60 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground-600 pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-background-400 text-primary-500 focus:ring-primary-400"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/about" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/about" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>
                      <i className="ri-arrow-right-line" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-foreground-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}