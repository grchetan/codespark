interface CssDemoProps {
  text?: string;
  color?: string;
}

export default function CssDemos({
  id,
  text,
  color = '#FF4D2E',
}: {
  id: string;
  text?: string;
  color?: string;
}) {
  if (id === 'e5') return <AuroraLoader color={color} />;
  if (id === 'e6') return <GradientMarquee text={text} color={color} />;
  if (id === 'e7') return <RippleButton text={text} color={color} />;
  if (id === 'e9') return <BlobMorph color={color} />;
  if (id === 'e12') return <ShimmerText text={text} color={color} />;
  if (id === 'e14') return <SkeletonPulse color={color} />;
  if (id === 'e11') return <GlassStack color={color} />;
  return <Fallback color={color} />;
}

function Fallback({ color = '#FF4D2E' }: CssDemoProps) {
  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-foreground-500">
      <i className="ri-loader-4-line animate-spin mr-2" style={{ color }} /> Live CSS Preview
    </div>
  );
}

function AuroraLoader({ color = '#FF4D2E' }: CssDemoProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-xl animate-pulse-soft"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
        <div
          className="absolute h-14 w-14 rounded-full blur-[5px] animate-spin-slow"
          style={{ backgroundColor: color }}
        />
        <div className="absolute h-8 w-8 rounded-full bg-emerald-500 blur-[3px] animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="h-3 w-3 rounded-full bg-foreground-950 shadow-inner" />
      </div>
    </div>
  );
}

function GradientMarquee({ text = 'CODESPARK', color = '#FF4D2E' }: CssDemoProps) {
  const word = (text || 'CODESPARK').toUpperCase();
  const line = [word, '✦', 'MOTION', '✦', 'INTERACTIVE', '✦'];
  const row = [...line, ...line];
  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-2 overflow-hidden px-2">
      <div className="w-full overflow-hidden">
        <div className="flex w-max animate-marquee gap-4">
          {row.map((w, i) => (
            <span
              key={i}
              className="bg-clip-text text-xl sm:text-2xl font-black uppercase tracking-tight text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${color}, #F59E0B, ${color})` }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <div className="flex w-max animate-marquee gap-4" style={{ animationDirection: 'reverse' }}>
          {row.map((w, i) => (
            <span key={i} className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground-400/30">
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RippleButton({ text = 'Click for Ripple', color = '#FF4D2E' }: CssDemoProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement('span');
    span.className = 'ripple-dot';
    span.style.width = span.style.height = `${d}px`;
    span.style.left = `${e.clientX - rect.left - d / 2}px`;
    span.style.top = `${e.clientY - rect.top - d / 2}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
  };
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <button
        onClick={handleClick}
        className="relative overflow-hidden rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer select-none max-w-full truncate"
        style={{ backgroundColor: color }}
      >
        <span className="relative z-10 flex items-center gap-1.5 truncate">
          <i className="ri-cursor-line text-xs shrink-0" />
          <span className="truncate">{text || 'Click for Ripple'}</span>
        </span>
        <style>{`.ripple-dot{position:absolute;border-radius:9999px;background:rgba(255,255,255,0.45);transform:scale(0);animation:fxRipple 0.7s ease-out forwards;pointer-events:none;}@keyframes fxRipple{to{transform:scale(1);opacity:0;}}`}</style>
      </button>
    </div>
  );
}

function BlobMorph({ color = '#FF4D2E' }: CssDemoProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div
        className="fx-blob h-24 w-24 sm:h-28 sm:w-28"
        style={{
          background: `linear-gradient(135deg, ${color}, #10b981)`,
          boxShadow: `0 8px 32px ${color}4D`,
        }}
      />
      <style>{`.fx-blob{filter:blur(1px);animation:fxMorph 7s ease-in-out infinite;}@keyframes fxMorph{0%,100%{border-radius:62% 38% 54% 46%/55% 48% 52% 45%;transform:rotate(0deg) scale(1);}33%{border-radius:35% 65% 58% 42%/63% 38% 62% 37%;transform:rotate(60deg) scale(1.06);}66%{border-radius:70% 30% 42% 58%/40% 60% 40% 60%;transform:rotate(120deg) scale(0.96);}}`}</style>
    </div>
  );
}

function ShimmerText({ text = 'CODESPARK', color = '#FF4D2E' }: CssDemoProps) {
  const display = (text || 'CODESPARK').toUpperCase();
  return (
    <div className="flex h-full w-full items-center justify-center px-4 text-center">
      <span
        className="fx-shimmer bg-clip-text text-3xl sm:text-4xl font-extrabold tracking-widest text-transparent break-words"
        style={{ backgroundImage: `linear-gradient(90deg, #948A79 0%, ${color} 50%, #948A79 100%)` }}
      >
        {display}
      </span>
      <style>{`.fx-shimmer{background-size:200% auto;animation:fxShimmer 2.5s linear infinite;}@keyframes fxShimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}`}</style>
    </div>
  );
}

function SkeletonPulse({ color = '#FF4D2E' }: CssDemoProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 px-6 max-w-[260px] mx-auto">
      <div className="fx-sk h-3 w-20 rounded-md" />
      <div className="fx-sk h-6 w-full rounded-md" />
      <div className="fx-sk h-3 w-2/3 rounded-md" />
      <div className="mt-1 flex gap-2.5 items-center">
        <div className="fx-sk h-8 w-8 rounded-full shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="fx-sk h-2.5 w-full rounded-md" />
          <div className="fx-sk h-2.5 w-1/2 rounded-md" />
        </div>
      </div>
      <style>{`.fx-sk{background:linear-gradient(90deg,transparent,${color}26,transparent);background-color:rgba(128,128,128,0.1);background-size:200% 100%;animation:fxSk 1.6s linear infinite;}@keyframes fxSk{0%{background-position:200% 0;}100%{background-position:-200% 0;}}`}</style>
    </div>
  );
}

function GlassStack({ color = '#FF4D2E' }: CssDemoProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div className="relative h-28 w-40">
        <div className="fx-stack absolute inset-0 translate-x-2 translate-y-2 rounded-xl border border-background-300/40 bg-background-200/40 backdrop-blur-sm" />
        <div className="fx-stack absolute inset-0 translate-x-1 translate-y-1 rounded-xl border border-background-300/60 bg-background-200/60 backdrop-blur-sm" />
        <div
          className="fx-stack absolute inset-0 rounded-xl border p-3 backdrop-blur-md shadow-md"
          style={{
            borderColor: `${color}66`,
            background: `linear-gradient(135deg, rgba(255,255,255,0.08), ${color}26)`,
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="h-2 w-8 rounded" style={{ backgroundColor: color }} />
            <div>
              <div className="h-1.5 w-full rounded bg-foreground-950/70" />
              <div className="mt-1.5 h-1.5 w-2/3 rounded bg-foreground-950/40" />
            </div>
          </div>
        </div>
      </div>
      <style>{`.fx-stack{transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);}@media (hover:hover){.fx-stack:hover{transform:translate(0,0);}}`}</style>
    </div>
  );
}