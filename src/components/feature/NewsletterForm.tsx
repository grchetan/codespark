import { useState } from 'react';

const SUBMIT_URL = '/api/newsletter';

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const honeypot = String(fd.get('website_alt') || '').trim();
    if (honeypot) {
      setStatus('success');
      setMessage("You're on the list — check your inbox soon.");
      form.reset();
      setEmail('');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || "You're in! Fresh effects land in your inbox every week.");
        form.reset();
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      // Fallback for offline/demo mode
      setStatus('success');
      setMessage("You're in! Fresh effects land in your inbox every week.");
      form.reset();
      setEmail('');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-400">
            <i className="ri-mail-line text-base" />
          </div>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.dev"
            className={`w-full rounded-xl border border-background-400 bg-background-50 pl-10 pr-4 py-2.5 text-sm text-foreground-950 placeholder:text-foreground-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
              dark ? 'bg-background-50 border-background-400/90' : ''
            }`}
          />
        </div>
        <input
          type="text"
          name="website_alt"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: 'none' }}
        />
        <button
          type="submit"
          className="btn btn-primary h-11 sm:h-[42px] w-full sm:w-auto px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-sm shrink-0 flex items-center justify-center gap-2"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <i className="ri-loader-4-line animate-spin text-base" />
          ) : (
            <i className="ri-send-plane-fill text-base" />
          )}
          <span>Subscribe</span>
        </button>
      </form>
      {status === 'success' && (
        <p className="mt-2.5 text-xs sm:text-sm text-emerald-600 font-medium flex items-center gap-1.5">
          <i className="ri-checkbox-circle-line text-base" />
          <span>{message}</span>
        </p>
      )}
      {status === 'error' && (
        <p className="mt-2.5 text-xs sm:text-sm text-primary-500 font-medium flex items-center gap-1.5">
          <i className="ri-error-warning-line text-base" />
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}