import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import NewsletterForm from '@/components/feature/NewsletterForm';

const values = [
  { icon: 'ri-eye-line', title: 'See it move', text: 'Static screenshots lie. Every effect runs live so you know exactly what you\'re getting.' },
  { icon: 'ri-scissors-2-line', title: 'Steal like an artist', text: 'Copyable, permissive code. No paywalls, no sign-up walls, no friction between you and shipping.' },
  { icon: 'ri-team-line', title: 'Community-first', text: 'Built by and for developers. Anyone can share, and the best work rises to the top.' },
  { icon: 'ri-leaf-line', title: 'Craft over quantity', text: 'We\'d rather have 500 outstanding effects than 50,000 forgettable ones.' },
];

const timeline = [
  { year: '2024', title: 'The idea', text: 'Tired of scrolling endless "inspiration" threads to find one working effect, we built a better way to browse.' },
  { year: '2025', title: 'The library', text: 'We launched with 200 hand-picked effects and live previews. Developers started sharing their own within weeks.' },
  { year: '2026', title: 'The community', text: 'Creators, likes, saves, leaderboards and submissions. CodeSpark became the place to discover and get discovered.' },
  { year: 'Now', title: 'The future', text: 'Collections, challenges, tutorials and an API — so the best effects live everywhere your builds do.' },
];

const faqs = [
  { q: 'Is CodeSpark really free?', a: 'Yes. Browsing, previewing, copying and using effects is completely free, forever. No account needed to copy code.' },
  { q: 'What license do effects use?', a: 'Most effects are MIT or BSD licensed. Each effect page shows its license so you can use it with confidence.' },
  { q: 'Can I submit my own effects?', a: 'Absolutely. Anyone can submit. Effects are reviewed for quality and clarity before appearing in the library.' },
  { q: 'Do the effects work in production?', a: 'They\'re real, working frontend code — no stubs. Every effect is tested in modern browsers before it\'s published.' },
];

export default function About() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-32 sm:pt-36 lg:pt-44 w-full max-w-full overflow-x-hidden">
        <section className="bg-grid relative overflow-hidden pb-16">
          <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-x relative z-10 max-w-3xl text-center">
            <p className="eyebrow">About CodeSpark</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground-950 md:text-6xl">
              The library the web deserves
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground-500">
              CodeSpark started with a simple frustration: beautiful effects are scattered across threads, tweets and dead CodePens. We built one home for them — live, organized, copyable, and built around the people who make them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-foreground-500">
              <span className="rounded-full border border-background-400 px-3 py-1">48k+ developers</span>
              <span className="rounded-full border border-background-400 px-3 py-1">4,200+ effects</span>
              <span className="rounded-full border border-background-400 px-3 py-1">100% free</span>
            </div>
          </div>
        </section>

        <section className="container-x py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="rounded-2xl border border-background-300/50 bg-background-50 p-6 shadow-sm transition-all hover:border-primary-400/40 hover:shadow-md h-full">
                  <span className="grid h-12 w-12 place-items-center rounded-lg border border-background-300/50 text-2xl text-primary-500"><i className={v.icon} /></span>
                  <h3 className="mt-4 font-body text-lg font-semibold text-foreground-950">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-500">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-background-300/40 bg-background-100/60 py-16">
          <div className="container-x max-w-3xl">
            <Reveal>
              <p className="eyebrow">Our journey</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground-950">From idea to ecosystem</h2>
            </Reveal>
            <div className="relative mt-10 space-y-8 border-l border-background-400/40 pl-8">
              {timeline.map((t, i) => (
                <Reveal key={t.year} delay={i * 60}>
                  <div className="relative">
                    <span className="absolute -left-[41px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background-400/40 bg-background-50">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    </span>
                    <p className="font-mono text-xs font-semibold text-primary-500">{t.year}</p>
                    <h3 className="mt-1 font-body text-lg font-semibold text-foreground-950">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground-500">{t.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="eyebrow">FAQ</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground-950">Questions, answered</h2>
              </Reveal>
              <div className="mt-8 space-y-3">
                {faqs.map((f, i) => (
                  <Reveal key={f.q} delay={i * 50}>
                    <details className="rounded-2xl border border-background-300/50 bg-background-50 p-5 shadow-sm group open:border-primary-400/40 transition-all">
                      <summary className="flex cursor-pointer items-center justify-between font-body text-base font-semibold text-foreground-950 [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <i className="ri-add-line text-lg text-foreground-500 transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-foreground-500">{f.a}</p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <Reveal delay={100}>
                <div className="rounded-2xl border border-background-300/50 bg-background-50 p-8 shadow-sm">
                  <p className="eyebrow">Stay in the loop</p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-foreground-950">Get the best effects weekly</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-500">
                    One email a week with the standout effects, creator spotlights and product updates. No noise, no spam — unsubscribe anytime.
                  </p>
                  <div className="mt-6"><NewsletterForm /></div>
                  <div className="mt-8 flex items-center gap-4">
                    <Link to="/contact" className="btn btn-secondary h-11 px-5">Contact us</Link>
                    <Link to="/community" className="btn btn-ghost text-sm font-body">Meet the community <i className="ri-arrow-right-line" /></Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}