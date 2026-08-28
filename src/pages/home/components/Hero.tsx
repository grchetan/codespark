import { Link } from 'react-router-dom';
import Reveal from '@/components/base/Reveal';

export default function Hero() {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-foreground-950 pt-[4.5rem] md:pt-[7.75rem]">
      {/* Subtle grid on dark */}
      <div className="absolute inset-0 bg-line-grid opacity-10" />
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-20" />

      {/* Geometric decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden w-full max-w-full">
        {/* Top-right constellation arcs */}
        <svg className="absolute -right-20 top-8 h-80 w-80 text-primary-500/15" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        {/* Bottom-left large arc */}
        <svg className="absolute -left-24 bottom-20 h-64 w-64 text-primary-500/10" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container-x relative z-10 w-full">
        <div className="relative flex flex-col py-10 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          {/* Left: Text content */}
          <div className="max-w-3xl min-w-0">
            <Reveal>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-primary-500" />
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.25em] text-primary-500 font-body break-words">
                  CODESPARK DROP 001 — UI INTERACTION LIBRARY
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-4 sm:mt-6 font-display text-[2.4rem] xs:text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6.5rem] font-normal leading-[0.95] tracking-wider text-background-50 break-words">
                EFFECTS<br />
                <span className="text-stroke block">THAT MAKE</span>
                YOUR UI<br />
                STAND <em className="font-serif italic text-primary-500">OUT.</em>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm leading-relaxed text-background-400">
                A developer library where hover effects, text animations, and cursor tricks ship straight into your build. No friction. Pure impact.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/effects"
                  className="inline-flex h-11 sm:h-12 items-center gap-2 bg-primary-500 px-5 sm:px-7 text-xs sm:text-sm font-semibold uppercase tracking-wider text-background-50 transition-colors hover:bg-primary-400"
                >
                  START YOUR BUILD <i className="ri-arrow-right-up-line" />
                </Link>
                <Link
                  to="/effects"
                  className="inline-flex h-11 sm:h-12 items-center border border-background-700 px-5 sm:px-7 text-xs sm:text-sm font-semibold uppercase tracking-wider text-background-50 transition-colors hover:bg-background-800"
                >
                  SEE THE EFFECTS
                </Link>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-background-600">
                <span className="flex items-center gap-1.5">
                  <i className="ri-checkbox-circle-line text-primary-500" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="ri-checkbox-circle-line text-primary-500" /> No sign-up required
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="ri-checkbox-circle-line text-primary-500" /> MIT licensed
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: Visual element */}
          <div className="relative mt-10 hidden lg:mt-0 lg:block shrink-0">
            <div className="relative w-64">
              <div className="rounded-lg border border-background-800 bg-background-950/80 p-4 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] font-mono text-background-600 uppercase tracking-wider">codespark.css</span>
                </div>
                <div className="font-mono text-[11px] text-background-400 leading-relaxed text-left">
                  <div className="text-primary-400">.spark-btn:hover {'{'}</div>
                  <div>  transform: scale(1.05);</div>
                  <div>  box-shadow: 0 12px</div>
                  <div>    40px rgba(255,77,46,0.25);</div>
                  <div>{'}'}</div>
                </div>
              </div>
              {/* Right side text */}
              <div className="absolute -top-8 -right-8 text-right">
                <div className="font-display text-4xl tracking-wider text-primary-500">ALL CODE</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-background-600">FREE FOREVER</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}