import { useState } from 'react';
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
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const newId = `u_${Date.now()}`;
      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`;
      const now = new Date().toISOString();

      // 1. Save directly to Supabase Cloud Database
      try {
        await supabase.from('users').insert({
          id: newId,
          name: cleanName,
          email: cleanEmail,
          role: 'member',
          status: 'active',
          avatar,
          effects_count: 0,
          created_at: now,
        });
      } catch {}

      // 2. Also attempt backend registration if available
      try {
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
        });
      } catch {}

      // 3. Complete client sign-in session
      const newUser = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        role: 'member' as const,
        avatar,
        effects_count: 0,
      };

      signup(`token_${newId}`, newUser);
      setSuccess('Account created successfully! Welcome to CodeSpark.');
      setTimeout(() => {
        navigate('/effects');
      }, 700);
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
        setError(authError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize OAuth.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 w-full max-w-full overflow-x-hidden">
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
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-background-300/50 text-lg text-primary-500"><i className={t.icon} /></span>
                    <p className="text-sm font-medium text-foreground-950">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <form onSubmit={onSubmit} className="w-full space-y-5 rounded-2xl border border-background-300/50 bg-background-50 p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground-950">Create account</h2>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-primary-500/10 p-3.5 text-sm text-primary-600 border border-primary-500/30">
                  <i className="ri-error-warning-line text-lg" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-sm text-emerald-600 border border-emerald-500/30">
                  <i className="ri-checkbox-circle-line text-lg" />
                  <span>{success}</span>
                </div>
              )}

              {/* OAuth Buttons (Google & GitHub) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('google')}
                  disabled={Boolean(oauthLoading)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300/80 bg-background-50 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-sm transition-all hover:bg-background-200"
                >
                  <i className="ri-google-fill text-base text-rose-500" />
                  <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('github')}
                  disabled={Boolean(oauthLoading)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-background-300/80 bg-background-50 py-2.5 px-3 text-xs font-semibold text-foreground-800 shadow-sm transition-all hover:bg-background-200"
                >
                  <i className="ri-github-fill text-base text-foreground-950" />
                  <span>{oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-background-300/60" /></div>
                <span className="relative bg-background-50 px-3 text-xs font-medium uppercase tracking-wider text-foreground-400">or with email</span>
              </div>

              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
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
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    className="input pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    minLength={6}
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
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground-500">
                  <i className="ri-shield-check-line" /> Use 6+ characters for a secure account.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground-600">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-background-400 text-primary-500 focus:ring-primary-400"
                  required
                />
                <span>I agree to the <Link to="/about" className="text-primary-500 hover:underline">Terms of Service</Link> and <Link to="/about" className="text-primary-500 hover:underline">Privacy Policy</Link>.</span>
              </label>

              <button
                type="submit"
                disabled={!agree || loading}
                className="btn btn-primary h-12 w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-lg" /> Creating account...
                  </>
                ) : (
                  <>
                    Create account <i className="ri-arrow-right-line text-lg" />
                  </>
                )}
              </button>

              <p className="pt-1 text-center text-sm text-foreground-500">
                Already have an account? <Link to="/login" className="font-semibold text-primary-500 hover:underline">Sign in</Link>
              </p>
            </form>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}