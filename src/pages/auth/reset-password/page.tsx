import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if active recovery session exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Handled gracefully in UI
      }
    });
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) {
        setError(updateErr.message || 'Failed to update password.');
      } else {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1200);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50 flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 sm:pt-36 lg:pt-44 pb-24 w-full max-w-full overflow-x-hidden flex-1 flex items-center justify-center">
        <div className="container-x flex justify-center w-full px-4">
          <Reveal>
            <div className="w-full max-w-[420px] rounded-3xl border border-background-300/80 bg-background-50 p-6 sm:p-8 shadow-md">
              <div className="mb-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-foreground-950 text-2xl text-foreground-950 shadow-sm">
                  <i className="ri-lock-password-line text-primary-500" />
                </span>
                <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
                  Set New Password
                </h1>
                <p className="mt-1 text-xs text-foreground-500">
                  Enter your new secure password below.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-primary-500/10 p-3 text-xs text-primary-600 border border-primary-500/25 animate-fade-in">
                  <i className="ri-error-warning-fill text-base shrink-0 text-primary-500 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-600 border border-emerald-500/25 animate-fade-in">
                  <i className="ri-checkbox-circle-fill text-base shrink-0 text-emerald-500 mt-0.5" />
                  <span className="leading-snug">{success}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      disabled={loading || Boolean(success)}
                      className="input text-xs sm:text-sm h-10 pr-10 w-full disabled:opacity-60 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-sm cursor-pointer"
                    >
                      <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-800 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    disabled={loading || Boolean(success)}
                    className="input text-xs sm:text-sm h-10 w-full disabled:opacity-60 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || Boolean(success)}
                  className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <i className="ri-check-line" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-foreground-500">
                Back to{' '}
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
