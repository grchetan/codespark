import { Link } from 'react-router-dom';
import Reveal from '@/components/base/Reveal';

const categoryMarqueeItems = [
  { label: 'Hover Effects', cat: 'hover' },
  { label: 'Text Animations', cat: 'text' },
  { label: '3D Cards', cat: '3d' },
  { label: 'Cursor Tricks', cat: 'cursor' },
  { label: 'Loaders', cat: 'loader' },
  { label: 'Transitions', cat: 'transitions' },
  { label: 'Scroll Interactions', cat: 'creative' },
];

const stats = [
  { num: '2,400+', label: 'SHIPPED EFFECTS' },
  { num: '85K', label: 'DEVS WHO SHOW UP' },
  { num: '4.9', label: 'HONEST REVIEWS' },
  { num: '0', label: 'BORING INTERFACES' },
];

export default function ImpactSection() {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-background-50">
      {/* Dark Seamless Infinite Category Marquee Band */}
      <div className="relative w-full max-w-full overflow-hidden border-y border-foreground-950/10 bg-foreground-950 py-3 sm:py-3.5 marquee-wrapper select-none">
        <div className="marquee-track flex items-center">
          {/* Set 1 */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-10 pr-6 sm:pr-10">
            {categoryMarqueeItems.map((item, i) => (
              <Link
                key={`set1-${i}`}
                to={`/effects?cat=${item.cat}`}
                className="flex shrink-0 items-center gap-6 sm:gap-10 whitespace-nowrap font-display text-xs sm:text-sm font-normal uppercase tracking-widest text-background-100 hover:text-primary-400 transition-colors cursor-pointer group"
              >
                <span className="group-hover:text-primary-400 transition-colors">{item.label}</span>
                <span className="text-primary-500 text-xs sm:text-sm transition-transform duration-300 group-hover:rotate-45">✦</span>
              </Link>
            ))}
          </div>

          {/* Set 2 (Identical Duplicate for 100% Seamless Infinite Looping) */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-10 pr-6 sm:pr-10" aria-hidden="true">
            {categoryMarqueeItems.map((item, i) => (
              <Link
                key={`set2-${i}`}
                to={`/effects?cat=${item.cat}`}
                tabIndex={-1}
                className="flex shrink-0 items-center gap-6 sm:gap-10 whitespace-nowrap font-display text-xs sm:text-sm font-normal uppercase tracking-widest text-background-100 hover:text-primary-400 transition-colors cursor-pointer group"
              >
                <span className="group-hover:text-primary-400 transition-colors">{item.label}</span>
                <span className="text-primary-500 text-xs sm:text-sm transition-transform duration-300 group-hover:rotate-45">✦</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-x py-12 sm:py-16 lg:py-24">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-end">
          <div className="min-w-0">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-body">/ 01 — COMMUNITY</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 sm:mt-4 font-display text-[2rem] xs:text-[2.6rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-normal uppercase leading-[0.95] tracking-wider text-foreground-950">
                TRUSTED BY THE<br />
                DEVS WHO<br />
                ACTUALLY <em className="font-serif italic text-primary-500">SHIP.</em>
              </h2>
            </Reveal>
          </div>
          <div className="lg:pb-4 min-w-0">
            <Reveal delay={160}>
              <p className="text-xs sm:text-sm leading-relaxed text-foreground-600">
                Numbers from twelve months of open-source contributions, weekly code drops, and very honest PR reviews in the CodeSpark community. Every effect is tested, every interaction is measured.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Stats grid */}
        <Reveal delay={240}>
          <div className="mt-8 sm:mt-12 grid grid-cols-2 border border-foreground-950/10 divide-x divide-y divide-foreground-950/10 lg:grid-cols-4 rounded-xl overflow-hidden bg-background-50">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 sm:p-6 lg:p-8 min-w-0">
                <div className="font-display text-[1.8rem] sm:text-[2.5rem] font-normal uppercase tracking-wider text-foreground-950 md:text-[3.5rem]">
                  {stat.num}
                </div>
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-foreground-500 truncate">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}