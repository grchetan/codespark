import React, { useState, useRef, useEffect } from 'react';

// ==============================================================================
// CODESPARK TRUSTED REACT EFFECTS REGISTRY
// ==============================================================================

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
            if (index < iteration) return text[index];
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
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <span
        onMouseEnter={scramble}
        className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#FF4D2E] cursor-pointer select-none"
      >
        {display}
      </span>
      <span className="text-[10px] text-foreground-400 uppercase tracking-wider">Hover to re-scramble</span>
    </div>
  );
}

// Registry Map (Connecting database component_key to trusted React components)
export const EFFECT_REGISTRY: Record<string, React.ComponentType<any>> = {
  MagneticButton: ReactMagneticButton,
  AuroraLoader: ReactAuroraLoader,
  TiltCard: ReactTiltCard,
  TextScramble: ReactTextScramble,
};

// React Source Code Documentation (for displaying in the React tab)
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
      className="relative px-8 py-4 text-sm font-bold text-white bg-[#FF4D2E] rounded-full shadow-xl hover:bg-[#ff6247]"
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
      <div className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase text-white/90">Loading...</span>
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
};
