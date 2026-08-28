import { Link } from 'react-router-dom';
import { founderCreator, officialCreator } from '@/mocks/effects';
import Reveal from '@/components/base/Reveal';

export default function Creators() {
  const list = [founderCreator, officialCreator];

  return (
    <section className="container-x py-14 sm:py-20 w-full max-w-full overflow-hidden">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Verified Leadership</p>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
              Built by developers,<br />for developers
            </h2>
          </div>
          <Link to="/community" className="btn btn-ghost text-xs sm:text-sm font-body">
            Explore creator hub <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
        {list.map((c, i) => (
          <Reveal key={c.id} delay={i * 70}>
            <Link to="/community" className="group flex flex-col items-center rounded-3xl border border-background-300/60 bg-background-50 p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50 hover:shadow-md min-w-0">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-500 text-2xl text-white font-bold shadow-md">
                  ⚡
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-foreground-950 text-background-50">
                  <i className="ri-verified-badge-fill text-xs text-primary-500" />
                </span>
              </div>
              <h3 className="mt-4 font-display text-base sm:text-lg font-bold text-foreground-950 truncate w-full flex items-center justify-center gap-1.5">
                {c.name}
                <i className="ri-verified-badge-fill text-primary-500 text-sm" />
              </h3>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider truncate w-full mt-0.5">{c.role}</p>
              <p className="mt-2 text-xs text-foreground-500 line-clamp-2">{c.bio}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}