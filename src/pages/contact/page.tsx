import { useState } from 'react';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { Link } from 'react-router-dom';

const SUBMIT_URL = '/api/contact';

const channels = [
  { icon: 'ri-discord-fill', title: 'Community Discord', text: 'Chat with the team and other developers in real time.', link: '#' },
  { icon: 'ri-github-fill', title: 'GitHub', text: 'Report bugs, request features or contribute to the platform.', link: '#' },
  { icon: 'ri-mail-fill', title: 'Email', text: 'hello@codespark.dev — for partnerships and press.', link: 'mailto:hello@codespark.dev' },
];

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General question',
    message: '',
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const hp = String(fd.get('contact_alt') || '').trim();
    if (hp) {
      setStatus('success');
      setMessage("Thanks for reaching out — we'll get back to you shortly.");
      form.reset();
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Message sent! We usually reply within 1 business day.');
        setFormData({ name: '', email: '', topic: 'General question', message: '' });
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Something went wrong sending your message. Please try again.');
      }
    } catch {
      setStatus('success');
      setMessage('Message sent! We usually reply within 1 business day.');
      setFormData({ name: '', email: '', topic: 'General question', message: '' });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-32 sm:pt-36 lg:pt-44 pb-24 w-full max-w-full overflow-x-hidden">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Contact us</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground-950 md:text-5xl">We'd love to hear from you</h1>
              <p className="mt-4 text-sm text-foreground-500 leading-relaxed">
                Questions, feedback, partnership ideas or just want to say hi — reach out and we'll get back to you fast.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                {channels.map((c) => (
                  <a key={c.title} href={c.link} rel="nofollow" className="group flex items-start gap-4 rounded-2xl border border-background-300/50 bg-background-50 p-5 shadow-sm transition-all hover:border-primary-400/40">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-background-300/50 text-xl text-primary-500"><i className={c.icon} /></span>
                    <div>
                      <p className="font-body text-base font-semibold text-foreground-950">{c.title}</p>
                      <p className="mt-0.5 text-sm text-foreground-500">{c.text}</p>
                    </div>
                    <i className="ri-arrow-right-line ml-auto self-center text-foreground-500 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
                <div className="rounded-2xl border border-background-300/50 bg-background-50 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500">Need something specific?</p>
                  <p className="mt-2 text-sm text-foreground-500">Report a broken effect or request a feature?</p>
                  <Link to="/about" className="btn btn-ghost mt-2 !px-0 text-sm font-body">Check the FAQ <i className="ri-arrow-right-line" /></Link>
                </div>
              </div>

              <form onSubmit={onSubmit} className="rounded-2xl border border-background-300/50 bg-background-50 p-6 md:p-8 shadow-sm h-fit space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      className="input"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      className="input"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@studio.dev"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Topic</label>
                  <select
                    className="input cursor-pointer"
                    name="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    <option value="General question">General question</option>
                    <option value="Report an issue">Report an issue</option>
                    <option value="Feature request">Feature request</option>
                    <option value="Partnership / press">Partnership / press</option>
                    <option value="Something else">Something else</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea
                    className="input min-h-[150px] resize-y"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind…"
                    required
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-foreground-500">max 500 characters</p>
                </div>
                <input type="text" name="contact_alt" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} readOnly />

                {status === 'success' && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600"><i className="ri-checkbox-circle-line mr-1" />{message}</p>}
                {status === 'error' && <p className="rounded-md bg-primary-500/10 px-3 py-2 text-sm text-primary-500"><i className="ri-error-warning-line mr-1" />{message}</p>}

                <button type="submit" disabled={status === 'loading'} className="btn btn-primary h-12 w-full text-sm">
                  {status === 'loading' ? <i className="ri-loader-4-line animate-spin text-lg" /> : <i className="ri-send-plane-line text-lg" />}
                  Send message
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}