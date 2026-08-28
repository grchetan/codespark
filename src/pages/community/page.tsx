import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { founderCreator, officialCreator } from '@/mocks/effects';

const stats = [
  { label: 'Active Developers', value: '1,200+', icon: 'ri-team-line' },
  { label: 'Official Effects', value: '18+', icon: 'ri-box-3-line' },
  { label: 'Code Snippets Copied', value: '50k+', icon: 'ri-file-copy-line' },
  { label: 'Free & MIT Licensed', value: '100%', icon: 'ri-shield-check-line' },
];

const perks = [
  {
    icon: 'ri-verified-badge-line',
    title: 'Verified Creator Profile',
    desc: 'Get your official verified badge and public author link on every component you submit.'
  },
  {
    icon: 'ri-flashlight-line',
    title: 'Instant Sandbox Compilation',
    desc: 'Your submitted effects compile live in our interactive sandbox without requiring static screenshot uploads.'
  },
  {
    icon: 'ri-global-line',
    title: 'Global Developer Reach',
    desc: 'Showcase your frontend craft to thousands of engineers, designers, and startup founders.'
  },
  {
    icon: 'ri-code-box-line',
    title: 'Clean Copy-Paste Standard',
    desc: 'We structure your code into automated step-by-step implementation guides for HTML, CSS, and JS.'
  }
];

export default function Community() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 w-full max-w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="bg-grid relative overflow-hidden pb-20">
          <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-x relative z-10 text-center">
            <span className="eyebrow">The Creator Hub</span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground-950 md:text-6xl">
              Built for Developers. Powered by CodeSpark.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground-500">
              CodeSpark is an open ecosystem of interactive UI animations, physics components, and micro-interactions. Explore verified official components or publish your own craft.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/submit" className="btn btn-primary h-12 px-7 text-sm font-semibold uppercase tracking-wider">
                <i className="ri-add-circle-line text-xl" /> Submit Your Effect
              </Link>
              <Link to="/effects" className="btn btn-secondary h-12 px-7 text-sm font-semibold">
                Explore Official Library
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="border-y border-background-300/40 bg-background-100/60">
          <div className="container-x grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-background-300/50 bg-background-50 text-2xl text-primary-500 shadow-sm">
                    <i className={s.icon} />
                  </span>
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground-950">{s.value}</p>
                    <p className="text-xs text-foreground-500 font-medium">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Official Core Team & Founder Spotlight */}
        <section className="container-x py-16">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="eyebrow">Core & Leadership</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground-950">
              Verified Team & Architecture
            </h2>
            <p className="mt-3 text-sm text-foreground-500">
              Curating, testing, and maintaining high-performance UI motion components for modern web applications.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {/* Founder Card */}
            <Reveal delay={80}>
              <div className="rounded-3xl border border-primary-500/30 bg-background-50 p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full hover:border-primary-500 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-500 text-2xl text-white shadow-md font-bold">
                      ⚡
                    </span>
                    <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-600 border border-primary-500/20">
                      Founder
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground-950 flex items-center gap-2">
                    {founderCreator.name}
                    <i className="ri-verified-badge-fill text-primary-500 text-lg" title="Verified Founder" />
                  </h3>
                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mt-0.5">
                    {founderCreator.role}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground-600">
                    {founderCreator.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-background-200 flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground-500">{founderCreator.handle}</span>
                  <Link to="/effects" className="btn btn-secondary h-8 px-3 text-xs font-semibold">
                    View Library
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Official System Card */}
            <Reveal delay={140}>
              <div className="rounded-3xl border border-background-300/60 bg-background-50 p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full hover:border-foreground-950 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground-950 text-2xl text-background-50 shadow-md">
                      <i className="ri-code-box-line" />
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                      Verified System
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground-950 flex items-center gap-2">
                    {officialCreator.name}
                    <i className="ri-verified-badge-fill text-emerald-500 text-lg" title="Verified System" />
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                    {officialCreator.role}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground-600">
                    {officialCreator.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-background-200 flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground-500">{officialCreator.handle}</span>
                  <Link to="/submit" className="btn btn-primary h-8 px-3 text-xs font-semibold">
                    Submit Effect
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Creator Perks & How to Become Verified */}
        <section className="border-t border-background-300/40 bg-background-100/40 py-16">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="eyebrow">Contribute & Grow</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground-950">
                Become a CodeSpark Contributor
              </h2>
              <p className="mt-3 text-sm text-foreground-500">
                Any developer can submit their CSS animations, Canvas shaders, and physics buttons.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((p, i) => (
                <Reveal key={p.title} delay={i * 70}>
                  <div className="rounded-2xl border border-background-300/60 bg-background-50 p-6 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-500/10 text-2xl text-primary-600 mb-4">
                        <i className={p.icon} />
                      </span>
                      <h4 className="font-display text-lg font-bold text-foreground-950">{p.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-foreground-600">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/submit" className="btn btn-primary h-12 px-8 text-sm font-semibold uppercase tracking-wider shadow-md">
                <i className="ri-sparkling-fill" /> Open Creator Studio & Submit Effect
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}