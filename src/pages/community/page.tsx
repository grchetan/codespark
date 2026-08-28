import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { creators, effects } from '@/mocks/effects';

const stats = [
  { label: 'Developers', value: '48k+', icon: 'ri-team-line' },
  { label: 'Effects shared', value: '4,200+', icon: 'ri-box-3-line' },
  { label: 'Likes given', value: '2.1M', icon: 'ri-heart-3-line' },
  { label: 'Code copied', value: '9.4M', icon: 'ri-file-copy-line' },
];

const activity = [
  { who: 'Ava Laurent', action: 'published', target: 'Text Scramble', t: '2m ago', icon: 'ri-code-line' },
  { who: 'Kenji Sato', action: 'liked', target: '3D Tilt Card', t: '14m ago', icon: 'ri-heart-line' },
  { who: 'Noor Haddad', action: 'saved', target: 'Spotlight Card', t: '31m ago', icon: 'ri-bookmark-line' },
  { who: 'Dimitri Okafor', action: 'published', target: 'Aurora Loader', t: '1h ago', icon: 'ri-code-line' },
  { who: 'Mara Voss', action: 'followed', target: 'Theo Marchand', t: '2h ago', icon: 'ri-user-add-line' },
  { who: 'Theo Marchand', action: 'commented on', target: 'Blob Morph', t: '3h ago', icon: 'ri-chat-3-line' },
];

const leaderboard = [...creators].sort((a, b) => b.followers - a.followers).slice(0, 5);

export default function Community() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 w-full max-w-full overflow-x-hidden">
        <section className="bg-grid relative overflow-hidden pb-20">
          <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-x relative z-10 text-center">
            <span className="eyebrow">The community</span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground-950 md:text-6xl">
              Effect makers, all in one place
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground-500">
              Thousands of developers share, like and remix effects every day. Find your people, follow the makers you admire, and build a collection the community talks about.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/submit" className="btn btn-primary h-12 px-7 text-sm">
                <i className="ri-add-circle-line text-xl" /> Share your work
              </Link>
              <Link to="/effects" className="btn btn-secondary h-12 px-7 text-sm">Explore the library</Link>
            </div>
          </div>
        </section>

        <section className="border-y border-background-300/40 bg-background-100/60">
          <div className="container-x grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-lg border border-background-300/50 text-2xl text-primary-500"><i className={s.icon} /></span>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground-950">{s.value}</p>
                    <p className="text-xs text-foreground-500">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container-x py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Reveal>
                <p className="eyebrow">Top creators</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground-950">This month's leaders</h2>
                <p className="mt-3 text-sm text-foreground-500">The effect makers earning the most attention right now.</p>
              </Reveal>
              <div className="mt-8 space-y-3">
                {leaderboard.map((c, i) => (
                  <Reveal key={c.id} delay={i * 60}>
                    <div className="flex items-center gap-4 rounded-2xl border border-background-300/50 bg-background-50 p-4 shadow-sm transition-all hover:border-primary-400/40">
                      <span className="font-display text-lg font-bold text-foreground-500/40 italic">#{i + 1}</span>
                      <img src={c.avatar} alt={c.name} className="h-11 w-11 rounded-full border border-background-300/50 object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground-950">{c.name}</p>
                        <p className="text-xs text-foreground-500">{c.role}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-semibold text-foreground-950">{c.followers >= 1000 ? `${(c.followers / 1000).toFixed(1)}k` : c.followers}</p>
                        <p className="text-[11px] text-foreground-500">followers</p>
                      </div>
                      <button className="btn btn-secondary ml-1 h-8 !px-3 text-xs">Follow</button>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div>
              <Reveal delay={100}>
                <p className="eyebrow">Live activity</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground-950">What's happening now</h2>
                <div className="mt-8 space-y-3">
                  {activity.map((a, i) => (
                    <Reveal key={i} delay={i * 50}>
                      <div className="flex items-center gap-4 rounded-2xl border border-background-300/50 bg-background-50 p-4 shadow-sm">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-background-300/50 text-lg text-primary-500"><i className={a.icon} /></span>
                        <p className="min-w-0 flex-1 truncate text-sm text-foreground-500">
                          <span className="font-semibold text-foreground-950">{a.who}</span> {a.action} <span className="font-semibold text-primary-500">{a.target}</span>
                        </p>
                        <span className="shrink-0 text-xs text-foreground-500">{a.t}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="container-x pb-20">
          <Reveal>
            <div className="bg-grid relative overflow-hidden rounded-2xl border border-background-300/40 bg-background-100/60 px-6 py-14 text-center md:px-16">
              <div className="pointer-events-none absolute -left-10 top-0 h-52 w-52 rounded-full bg-accent-500/15 blur-[90px]" />
              <div className="relative z-10 mx-auto max-w-2xl">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary-400/30 text-2xl text-primary-500"><i className="ri-gift-line" /></span>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground-950">Join the movement</h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground-500">
                  Become a creator, get featured, and help grow the biggest shared collection of frontend effects on the web. It starts with one submission.
                </p>
                <Link to="/submit" className="btn btn-primary mt-7 h-12 px-7 text-sm">Start sharing <i className="ri-arrow-right-line" /></Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}