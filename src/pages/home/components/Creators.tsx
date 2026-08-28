import { Link } from 'react-router-dom';
import { featuredCreators } from '@/mocks/effects';
import Reveal from '@/components/base/Reveal';

export default function Creators() {
  const list = featuredCreators.slice(0, 4);
  return (
    <section className="container-x py-14 sm:py-20 w-full max-w-full overflow-hidden">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Meet the makers</p>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
              Built by developers,<br />for developers
            </h2>
          </div>
          <Link to="/community" className="btn btn-ghost text-xs sm:text-sm font-body">
            Explore community <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 w-full">
        {list.map((c, i) => (
          <Reveal key={c.id} delay={i * 70}>
            <Link to="/community" className="group flex flex-col items-center rounded-2xl border border-background-300/50 bg-background-50 p-4 sm:p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-md min-w-0">
              <div className="relative">
                <img src={c.avatar} alt={c.name} className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border border-background-300/50 object-cover transition-all group-hover:border-primary-400/50" />
                <span className="absolute -bottom-1 -right-1 grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full bg-foreground-950 text-background-50">
                  <i className="ri-verified-badge-fill text-[10px] sm:text-xs text-primary-500" />
                </span>
              </div>
              <h3 className="mt-3 sm:mt-4 font-body text-xs sm:text-sm font-semibold text-foreground-950 truncate w-full">{c.name}</h3>
              <p className="text-[11px] sm:text-xs text-foreground-500 truncate w-full">{c.role}</p>
              <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-foreground-500">
                <span className="flex items-center gap-1">
                  <i className="ri-fire-line text-primary-400" />
                  {c.followers >= 1000 ? `${(c.followers / 1000).toFixed(1)}k` : c.followers}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-box-3-line text-accent-500" />
                  {c.effects}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}