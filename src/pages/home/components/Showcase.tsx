import { useState } from 'react';
import Reveal from '@/components/base/Reveal';
import LivePreview from '@/components/feature/LivePreview';
import { effectCode } from '@/mocks/code';

const steps = [
  { n: '01', title: 'Discover', icon: 'ri-compass-3-line', text: 'Browse a library of real, working frontend effects — organized, tagged and searchable.' },
  { n: '02', title: 'Preview', icon: 'ri-eye-line', text: 'Every effect runs live right on the card. No screenshots, no guessing — see it move.' },
  { n: '03', title: 'Understand', icon: 'ri-code-box-line', text: 'Open an effect for clean, commented code plus the thinking behind each interaction.' },
  { n: '04', title: 'Copy & use', icon: 'ri-rocket-line', text: 'One click to copy. Drop it into your project and ship something that stands out.' },
];

export default function Showcase() {
  const [active, setActive] = useState('e8');
  return (
    <section className="container-x py-14 sm:py-20 w-full max-w-full overflow-hidden">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center w-full">
        <div className="min-w-0">
          <Reveal>
            <p className="eyebrow">From browse to build</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
              Discover → Preview<br />→ Copy → Use
            </h2>
            <p className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm leading-relaxed text-foreground-700">
              We removed every obstacle between seeing an effect and shipping it. Explore, verify it feels right, grab the code and move on with your build.
            </p>
          </Reveal>

          <div className="mt-8 sm:mt-10 space-y-1">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="group flex items-start gap-3 sm:gap-4 rounded-xl border border-transparent p-3 sm:p-4 transition-all duration-300 hover:border-background-300/60 hover:bg-background-100/70">
                  <span className="font-display text-sm font-bold text-primary-500 italic shrink-0">{s.n}</span>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 font-body text-sm font-semibold text-foreground-950">
                      <i className={`${s.icon} text-base text-primary-500`} /> {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground-600">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="min-w-0 w-full">
          <Reveal delay={120}>
            <div className="w-full overflow-hidden rounded-2xl border border-[rgba(245,241,234,0.14)] bg-[#0D0F12] shadow-2xl">
              {/* Dark terminal header */}
              <div className="flex items-center justify-between border-b border-[rgba(245,241,234,0.1)] bg-[#12151A] px-4 sm:px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 sm:ml-3 text-[10px] font-mono text-[#918A80] uppercase tracking-wider">effect-preview.css</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">live</span>
              </div>
              <div className="h-48 sm:h-56 bg-[#0D0F12] overflow-hidden">
                <LivePreview id={active} darkStage={true} />
              </div>
              <div className="grid grid-cols-4 gap-1 border-y border-[rgba(245,241,234,0.1)] bg-[#171A20] p-1.5 sm:p-2">
                {[
                  { id: 'e8', label: 'Spotlight' },
                  { id: 'e2', label: 'Tilt' },
                  { id: 'e3', label: 'Scramble' },
                  { id: 'e9', label: 'Blob' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setActive(d.id)}
                    className={`rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-medium font-body transition-colors truncate ${active === d.id ? 'bg-primary-500 text-[#FAF6EE] font-bold' : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="code-scroll max-h-36 sm:max-h-40 overflow-x-auto overflow-y-auto bg-[#0D0F12] px-4 sm:px-5 py-3 font-mono text-[11px] leading-relaxed text-[#F5F1EA] w-full min-w-0">
                <pre className="whitespace-pre overflow-x-auto">{effectCode[active]?.css}</pre>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}