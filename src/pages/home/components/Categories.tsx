import { Link } from 'react-router-dom';
import { categories, effects } from '@/mocks/effects';
import Reveal from '@/components/base/Reveal';

export default function Categories() {
  const cats = categories.filter((c) => c.key !== 'all');
  return (
    <section className="container-x py-14 sm:py-20 w-full max-w-full overflow-hidden">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Browse by category</p>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
              Find the exact interaction
            </h2>
          </div>
          <Link to="/effects" className="btn btn-ghost text-xs sm:text-sm font-body">
            View all categories <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
        {cats.map((c, i) => {
          const count = effects.filter((e) => e.category === c.key).length;
          return (
            <Reveal key={c.key} delay={i * 50}>
              <Link
                to={`/effects?cat=${c.key}`}
                className="group flex items-start gap-3.5 rounded-xl border border-background-300/50 bg-background-50 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-md min-w-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-background-300/50 text-base text-primary-500 transition-colors group-hover:border-primary-400/60 group-hover:bg-primary-50">
                  <i className={c.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 font-body text-sm font-semibold text-foreground-950">
                    <span className="truncate">{c.label}</span>
                    <span className="shrink-0 rounded-full bg-background-200/70 px-2 py-0.5 text-[10px] font-medium text-foreground-500">{count}+</span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-foreground-500 line-clamp-2">{c.blurb}</span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}