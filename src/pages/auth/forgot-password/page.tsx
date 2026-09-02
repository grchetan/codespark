import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message || 'Failed to send password reset email.');
      } else {
        setSuccess('Password reset link has been sent to your email address. Please check your inbox.');
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
                  <i className="ri-key-2-line text-primary-500" />
                </span>
                <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
                  Reset Password
                </h1>
                <p className="mt-1 text-xs text-foreground-500">
                  Enter your verified email to receive a secure recovery link.
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

              <form onSubmit={handleResetRequest} className="space-y-4">
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
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <i className="ri-mail-send-line" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-foreground-500">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                  Back to Sign in
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
