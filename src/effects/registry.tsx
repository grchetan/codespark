import React, { useState, useRef, useEffect } from 'react';
import SplashCursor, { SplashCursorHandle } from './SplashCursor';

// ==============================================================================
// CODESPARK TRUSTED REACT EFFECTS REGISTRY
// ==============================================================================

export interface ManualReactEffect {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
  isOfficial?: boolean;
}

// 1. Magnetic Button Component
export function ReactMagneticButton({ text = 'Hover Me' }: { text?: string }) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center justify-center p-8">
      <button
        ref={btnRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
        }}
        className="relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-[#FF4D2E] rounded-full shadow-xl hover:shadow-2xl hover:bg-[#ff6247] active:scale-95 cursor-pointer"
      >
        <span>{text}</span>
      </button>
    </div>
  );
}

// 2. Aurora Ambient Loader Component
export function ReactAuroraLoader() {
  return (
    <div className="relative flex items-center justify-center p-12 overflow-hidden rounded-2xl bg-[#0f1115]">
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse" />
      <div className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase text-white/90">Loading Core...</span>
      </div>
    </div>
  );
}

// 3. 3D Tilt Card Component
export function ReactTiltCard({ title = 'Interactive 3D Card' }: { title?: string }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = ((clientY - (top + height / 2)) / height) * -20;
    const y = ((clientX - (left + width / 2)) / width) * 20;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center justify-center p-8 [perspective:1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: rotate.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
        }}
        className="w-72 h-44 rounded-2xl bg-gradient-to-br from-[#1a1c23] to-[#0d0e12] p-6 border border-white/10 shadow-2xl flex flex-col justify-between text-white select-none cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-orange-400">3D DEPTH</span>
          <i className="ri-box-3-line text-lg text-white/40" />
        </div>
        <div>
          <h4 className="font-bold text-base">{title}</h4>
          <p className="text-xs text-white/50 mt-1">Move cursor to experience 3D perspective</p>
        </div>
      </div>
    </div>
  );
}

// 4. Text Scramble Decoder Component
export function ReactTextScramble({ text = 'CODESPARK UI' }: { text?: string }) {
  const [display, setDisplay] = useState(text);
  const glyphs = 'ABCDEF0123456789!@#$%^&*()_+-=~';

  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    scramble();
  }, [text]);

  return (
    <div className="flex items-center justify-center p-8">
      <button
        onClick={scramble}
        className="px-6 py-3 rounded-xl bg-background-100 border border-background-300 font-mono text-xl sm:text-2xl font-black text-[#FF4D2E] tracking-wider shadow-sm hover:border-[#FF4D2E] transition-colors cursor-pointer"
      >
        {display}
      </button>
    </div>
  );
}

// 5. Fluid Splash Cursor Component
export function ReactSplashCursor() {
  const splashRef = useRef<SplashCursorHandle>(null);
  const lastBurstRef = useRef<number>(0);

  const handleBurst = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    splashRef.current?.burst(rect);
  };

  const handleImageMove = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastBurstRef.current > 300) {
      lastBurstRef.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      splashRef.current?.burst(rect);
    }
  };

  return (
    <div className="relative w-full min-h-[540px] sm:min-h-[640px] rounded-3xl overflow-hidden bg-[#faf6ee] text-[#121c15] select-none shadow-2xl border border-stone-200/80 p-4 sm:p-8 flex flex-col justify-between">
      {/* Background WebGL Fluid simulation */}
      <SplashCursor
        ref={splashRef}
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        RAINBOW_MODE={true}
        SPLAT_RADIUS={0.28}
        DENSITY_DISSIPATION={1.0}
        VELOCITY_DISSIPATION={1.2}
        CURL={18}
        SPLAT_FORCE={7000}
        COLOR_UPDATE_SPEED={12}
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={640}
        PRESSURE_ITERATIONS={12}
        TRANSPARENT={true}
      />

      {/* Top Demo Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-stone-900/10">
        <div className="flex items-center gap-4 sm:gap-6 font-serif italic text-sm sm:text-base font-medium">
          <span className="hover:opacity-75 cursor-pointer">Listings</span>
          <span className="hover:opacity-75 cursor-pointer">Sell</span>
          <span className="hover:opacity-75 cursor-pointer">About</span>
        </div>

        <div className="flex flex-col items-center">
          <svg className="w-5 h-5 text-[#121c15] mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c0-5.523 0-8.5 0-11m0 0C12 6.5 8.5 3 3.5 3c0 4.5 3.5 8 8.5 8zm0 0c0-4.5 3.5-8 8.5-8 0 4.5-3.5 8-8.5 8z" />
          </svg>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#121c15]">Green Vale</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/preview/splash-cursor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121c15] text-[#faf6ee] text-xs font-bold hover:bg-black transition-all shadow-sm cursor-pointer"
          >
            <span>Open Fullscreen</span>
            <i className="ri-external-link-line" />
          </a>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 text-center my-6 sm:my-8 pointer-events-none">
        <h1 className="font-serif font-black text-4xl sm:text-7xl md:text-8xl tracking-tight leading-none text-[#0d1810] uppercase">
          Green Vale
        </h1>
        <p className="font-serif italic font-normal text-base sm:text-xl text-[#1a291f] tracking-wide mt-2">
          Your Next Home is Here
        </p>
      </div>

      {/* Interactive Cards & Content */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
        <div
          onMouseEnter={handleBurst}
          onMouseMove={handleImageMove}
          className="w-full rounded-2xl overflow-hidden shadow-xl bg-[#ede6d8] aspect-[16/10] sm:aspect-[4/3] max-h-[260px] cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
        >
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
            alt="Living interior"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        <div className="flex flex-col justify-center space-y-3 bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FF4D2E]">
            Interactive Burst Physics
          </span>
          <h4 className="font-serif font-bold text-lg sm:text-xl text-[#0d1810]">
            Move Cursor To Paint Waves
          </h4>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Gliding over images triggers perimeter splashes. Click below to test instantaneous outward velocity explosions.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={handleBurst}
              className="px-4 py-2 rounded-xl bg-[#FF4D2E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#ff6247] active:scale-95 transition-all cursor-pointer"
            >
              Trigger Burst ⚡
            </button>
            <a
              href="/preview/splash-cursor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#121c15] underline hover:text-[#FF4D2E] transition-colors"
            >
              Full Window View ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manual React Effects Metadata Registry
export const MANUAL_REACT_EFFECTS: ManualReactEffect[] = [
  {
    id: 'react-magnetic-button',
    slug: 'magnetic-button',
    name: 'Magnetic Button',
    category: 'hover',
    categoryLabel: 'Hover',
    description: 'A CTA that is subtly pulled toward your cursor with spring physics.',
    tags: ['magnetic', 'button', 'react', 'cursor'],
    difficulty: 'medium',
    isOfficial: true,
  },
  {
    id: 'react-tilt-card',
    slug: '3d-tilt-card',
    name: '3D Tilt Card',
    category: '3d',
    categoryLabel: '3D / Tilt',
    description: 'A perspective card that rotates dynamically on the X and Y axes as you move cursor.',
    tags: ['3d', 'perspective', 'react', 'tilt'],
    difficulty: 'medium',
    isOfficial: true,
  },
  {
    id: 'react-text-scramble',
    slug: 'text-scramble',
    name: 'Text Scramble Decoder',
    category: 'text',
    categoryLabel: 'Text',
    description: 'Characters violently scramble and decode into the final word. Perfect for hero headlines.',
    tags: ['text', 'scramble', 'react', 'animation'],
    difficulty: 'advanced',
    isOfficial: true,
  },
  {
    id: 'react-aurora-loader',
    slug: 'aurora-loader',
    name: 'Aurora Ambient Loader',
    category: 'loader',
    categoryLabel: 'Loaders',
    description: 'Soft blurred color blobs that rotate in opposing directions — an organic, ambient loading state.',
    tags: ['loader', 'aurora', 'react', 'ambient'],
    difficulty: 'easy',
    isOfficial: true,
  },
  {
    id: 'react-splash-cursor',
    slug: 'splash-cursor',
    name: 'Fluid Splash Cursor',
    category: 'cursor',
    categoryLabel: 'Cursor Tricks',
    description: 'Interactive GPU-accelerated WebGL fluid simulation with Navier–Stokes pressure solver, colorful particle ribbons, and perimeter burst physics.',
    tags: ['cursor', 'fluid', 'webgl', 'physics', 'react', 'splash', 'animation'],
    difficulty: 'advanced',
    isOfficial: true,
  },
];

// Mapping to actual React Components
export const EFFECT_REGISTRY: Record<string, React.ComponentType<any>> = {
  MagneticButton: ReactMagneticButton,
  AuroraLoader: ReactAuroraLoader,
  TiltCard: ReactTiltCard,
  TextScramble: ReactTextScramble,
  SplashCursor: ReactSplashCursor,
};

// Trusted Raw React Code Snippets for TSX Tab
export const REACT_CODE_SNIPPETS: Record<string, string> = {
  MagneticButton: `import React, { useState, useRef } from 'react';

export default function MagneticButton({ children = 'Hover Me' }) {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: \`translate(\${pos.x}px, \${pos.y}px)\`,
        transition: pos.x === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
      }}
      className="px-8 py-4 bg-[#FF4D2E] text-white font-bold rounded-full shadow-lg"
    >
      {children}
    </button>
  );
}`,
  AuroraLoader: `import React from 'react';

export default function AuroraLoader() {
  return (
    <div className="relative flex items-center justify-center p-12 overflow-hidden rounded-2xl bg-[#0f1115]">
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse" />
      <div className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Loading...</span>
      </div>
    </div>
  );
}`,
  TiltCard: `import React, { useState, useRef } from 'react';

export default function TiltCard({ title = '3D Card' }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = ((clientY - (top + height / 2)) / height) * -20;
    const y = ((clientX - (left + width / 2)) / width) * 20;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div className="[perspective:1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: \`rotateX(\${rotate.x}deg) rotateY(\${rotate.y}deg)\`,
          transition: rotate.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
        }}
        className="w-72 h-44 rounded-2xl bg-gradient-to-br from-[#1a1c23] to-[#0d0e12] p-6 border border-white/10 shadow-2xl text-white"
      >
        <h4 className="font-bold text-base">{title}</h4>
      </div>
    </div>
  );
}`,
  TextScramble: `import React, { useState, useEffect } from 'react';

export default function TextScramble({ text = 'CODESPARK' }) {
  const [display, setDisplay] = useState(text);
  const glyphs = 'ABCDEF0123456789!@#$%^&*()_+-=~';

  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) return text[index];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('')
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => { scramble(); }, [text]);

  return (
    <span onMouseEnter={scramble} className="font-mono text-2xl font-black text-[#FF4D2E] cursor-pointer">
      {display}
    </span>
  );
}`,
  SplashCursor: `import React, { useRef } from 'react';
import SplashCursor, { SplashCursorHandle } from './SplashCursor';

export default function FluidCursorDemo() {
  const splashRef = useRef<SplashCursorHandle>(null);

  const handleBurst = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    splashRef.current?.burst(rect);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col items-center justify-center overflow-hidden selection:bg-[#FF4D2E]">
      {/* Background WebGL Fluid Canvas */}
      <SplashCursor
        ref={splashRef}
        RAINBOW_MODE={true}
        SPLAT_RADIUS={0.28}
        DENSITY_DISSIPATION={1.0}
        VELOCITY_DISSIPATION={1.2}
        CURL={18}
        SPLAT_FORCE={7000}
        COLOR_UPDATE_SPEED={12}
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={640}
        PRESSURE_ITERATIONS={12}
        TRANSPARENT={true}
      />

      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
          WebGL Fluid Simulation
        </h1>
        <p className="text-stone-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
          Buttery smooth 60fps GPU fluid dynamics powered by Navier–Stokes pressure solvers.
        </p>
        <button
          onClick={handleBurst}
          className="px-6 py-3 rounded-xl bg-[#FF4D2E] text-white font-bold shadow-lg hover:bg-[#ff6247] active:scale-95 transition-all cursor-pointer"
        >
          Click for Fluid Burst ⚡
        </button>
      </div>
    </div>
  );
}`,
};
