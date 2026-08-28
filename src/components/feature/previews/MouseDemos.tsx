import { useEffect, useRef, useState } from 'react';

interface DemoProps {
  text?: string;
  subText?: string;
  color?: string;
}

export default function MouseDemos({
  id,
  text,
  subText,
  color = '#FF4D2E',
}: {
  id: string;
  text?: string;
  subText?: string;
  color?: string;
}) {
  if (id === 'e1') return <MagneticButton text={text} color={color} />;
  if (id === 'e2') return <TiltCard text={text} subText={subText} color={color} />;
  if (id === 'e3') return <TextScramble text={text} color={color} />;
  if (id === 'e4') return <CursorSpotlight text={text} color={color} />;
  if (id === 'e8') return <SpotlightCard text={text} subText={subText} color={color} />;
  if (id === 'e10') return <PageReveal text={text} color={color} />;
  if (id === 'e13') return <CursorFollower text={text} color={color} />;
  if (id === 'e15') return <ParallaxTilt text={text} color={color} />;
  if (id === 'e16') return <MagneticNav color={color} />;
  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-foreground-500">
      <i className="ri-sparkling-2-line mr-1.5" style={{ color }} /> Live Interactive Effect
    </div>
  );
}

function usePointer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, w: 300, h: 200 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const updateSize = () => {
      const r = el.getBoundingClientRect();
      setPos((prev) => ({ ...prev, w: r.width || 300, h: r.height || 200 }));
    };
    updateSize();

    const move = (e: MouseEvent | TouchEvent) => {
      const r = el.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPos({
        x: clientX - r.left,
        y: clientY - r.top,
        w: r.width || 300,
        h: r.height || 200,
      });
    };

    el.addEventListener('mousemove', move);
    el.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('resize', updateSize);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('touchmove', move);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return { ref, pos, hover, setHover };
}

function MagneticButton({ text = 'Magnetic CTA', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  const cx = pos.w / 2;
  const cy = pos.h / 2;
  const tx = hover ? (pos.x - cx) * 0.35 : 0;
  const ty = hover ? (pos.y - cy) * 0.35 : 0;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="flex h-full w-full items-center justify-center p-4"
    >
      <div
        className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg cursor-pointer select-none max-w-full truncate"
        style={{
          backgroundColor: color,
          transform: `translate(${tx}px, ${ty}px)`,
          transition: hover ? 'transform 0.12s ease-out' : 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: hover ? `0 12px 28px ${color}66` : `0 4px 14px ${color}40`,
        }}
      >
        <span className="flex items-center gap-1.5 truncate">
          <i className="ri-cursor-fill text-xs shrink-0" />
          <span className="truncate">{text || 'Magnetic CTA'}</span>
        </span>
      </div>
    </div>
  );
}

function TiltCard({ text = '3D Perspective Card', subText = 'Dynamic axis rotation on mousemove', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  const cx = pos.w / 2;
  const cy = pos.h / 2;
  const rx = hover ? ((pos.y - cy) / cy) * -16 : 0;
  const ry = hover ? ((pos.x - cx) / cx) * 16 : 0;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="flex h-full w-full items-center justify-center p-4"
      style={{ perspective: '800px' }}
    >
      <div
        className="relative w-full max-w-[240px] rounded-xl bg-gradient-to-br from-background-100 to-background-200 p-4 shadow-md transition-all"
        style={{
          borderColor: `${color}4D`,
          borderWidth: '1px',
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${hover ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
          transition: hover ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="h-2 w-12 rounded" style={{ backgroundColor: color, transform: 'translateZ(20px)' }} />
        <div className="mt-3 text-xs font-bold text-foreground-950 truncate" style={{ transform: 'translateZ(24px)' }}>
          {text || '3D Perspective Card'}
        </div>
        <div className="mt-1 text-[10px] text-foreground-500 line-clamp-2" style={{ transform: 'translateZ(16px)' }}>
          {subText || 'Dynamic axis rotation on mousemove'}
        </div>
        <div className="mt-3 flex justify-end">
          <span
            className="grid h-6 w-6 place-items-center rounded text-xs"
            style={{ backgroundColor: `${color}20`, color: color, transform: 'translateZ(30px)' }}
          >
            <i className="ri-box-3-line" />
          </span>
        </div>
      </div>
    </div>
  );
}

function CursorSpotlight({ text = 'Move cursor across this line', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-4"
    >
      <div className="relative px-4 text-center select-none max-w-full">
        <span className="text-lg sm:text-2xl font-bold tracking-tight text-foreground-400/30 break-words">
          {text || 'Move cursor across this line'}
        </span>
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 flex items-center justify-center text-center"
          style={{
            background: hover
              ? `radial-gradient(110px circle at ${pos.x}px ${pos.y}px, ${color}33 0%, transparent 80%)`
              : 'transparent',
          }}
        >
          {hover && (
            <span className="text-lg sm:text-2xl font-bold tracking-tight break-words" style={{ color }}>
              {text || 'Move cursor across this line'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SpotlightCard({ text = 'Radial Light Beam', subText = 'Spotlight glowing card', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="flex h-full w-full items-center justify-center p-4"
    >
      <div className="relative w-full max-w-[240px] overflow-hidden rounded-xl border border-background-300/80 bg-background-50 p-4 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(140px circle at ${pos.x}px ${pos.y}px, ${color}33, transparent 70%)`,
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {text || 'Spotlight'}
          </span>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <div className="mt-2 text-xs font-semibold text-foreground-950 truncate">
          {subText || 'Radial Light Beam'}
        </div>
        <div className="mt-1.5 h-1.5 w-3/4 rounded bg-background-300/80" />
        <div className="mt-1 h-1.5 w-1/2 rounded bg-background-300/50" />
      </div>
    </div>
  );
}

function PageReveal({ text = 'Page A', color = '#FF4D2E' }: DemoProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-full w-full items-center justify-center gap-3 p-4">
      <div
        className="relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg bg-background-200 shadow-inner"
        style={{
          clipPath: open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
          transition: 'clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: `linear-gradient(135deg, ${color}, #10B981)` }}
        />
        <span className="relative text-xs font-bold text-white truncate px-2">
          {text || 'Page A'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="chip text-[11px] hover:border-primary-500"
      >
        <i className="ri-swap-line" style={{ color }} /> Toggle
      </button>
    </div>
  );
}

function CursorFollower({ text = 'Hover to guide follower', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-4"
    >
      <div
        className="pointer-events-none absolute h-3.5 w-3.5 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 14px ${color}`,
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          opacity: hover ? 1 : 0,
          transition: 'transform 0.1s ease-out, opacity 0.2s',
        }}
      />
      <div
        className="pointer-events-none absolute h-8 w-8 rounded-full"
        style={{
          border: `1px solid ${color}88`,
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          opacity: hover ? 1 : 0,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s',
        }}
      />
      <span className="text-xs font-medium text-foreground-400 text-center px-2">
        {hover ? 'Tracing pointer...' : text || 'Hover to guide follower'}
      </span>
    </div>
  );
}

function ParallaxTilt({ text = 'PARALLAX', color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  const cx = (pos.x - pos.w / 2) * 0.15;
  const cy = (pos.y - pos.h / 2) * 0.15;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="flex h-full w-full items-center justify-center p-4"
      style={{ perspective: '800px' }}
    >
      <div
        className="relative h-28 w-44 rounded-xl bg-background-200/80 border border-background-300/80 flex items-center justify-center shadow-md overflow-hidden"
        style={{
          transform: hover ? `rotateY(${cx * 0.8}deg) rotateX(${-cy * 0.8}deg)` : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <span
          className="text-xs font-mono font-bold text-foreground-400 select-none"
          style={{ transform: `translate(${cx * 0.4}px, ${cy * 0.4}px)` }}
        >
          BG LAYER
        </span>
        <span
          className="absolute text-sm font-bold truncate px-2 select-none"
          style={{
            color,
            transform: `translate(${cx * 1.2}px, ${cy * 1.2}px) translateZ(24px)`,
          }}
        >
          {text || 'PARALLAX'}
        </span>
      </div>
    </div>
  );
}

function MagneticNav({ color = '#FF4D2E' }: DemoProps) {
  const { ref, pos, hover, setHover } = usePointer<HTMLDivElement>();
  const items = ['Explore', 'Studio', 'Docs'];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      className="flex h-full w-full items-center justify-center p-2"
    >
      <div className="flex gap-1.5 rounded-full border border-background-300/80 bg-background-100/70 p-1">
        {items.map((label, i) => {
          const itemX = (i + 1) * (pos.w / 4);
          const active = hover && Math.abs(pos.x - itemX) < 40;
          return (
            <span
              key={label}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-all select-none"
              style={{
                backgroundColor: active ? color : 'transparent',
                color: active ? '#ffffff' : 'inherit',
                transform: active ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TextScramble({ text = 'CODESPARK', color = '#FF4D2E' }: DemoProps) {
  const chars = '!<>-_\\/[]—=+*^?#';
  const target = (text || 'CODESPARK').toUpperCase();
  const [out, setOut] = useState(target);

  useEffect(() => {
    let frame = 0;
    const total = 22;
    let timer: ReturnType<typeof setInterval>;
    const run = () => {
      timer = setInterval(() => {
        frame++;
        let res = '';
        for (let i = 0; i < target.length; i++) {
          res += target[i] && Math.random() < (frame / total) * 0.85 ? target[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        setOut(res);
        if (frame >= total) {
          clearInterval(timer);
          setOut(target);
        }
      }, 50);
    };
    run();
    const iv = setInterval(() => {
      frame = 0;
      run();
    }, 2800);
    return () => {
      clearInterval(iv);
      clearInterval(timer);
    };
  }, [target]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4 text-center">
      <span
        className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider break-words"
        style={{ color }}
      >
        {out}
      </span>
    </div>
  );
}