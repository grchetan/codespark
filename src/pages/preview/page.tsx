import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SplashCursor, { type SplashCursorHandle } from '@/effects/SplashCursor';
import { EFFECT_REGISTRY } from '@/effects/registry';

export default function EffectFullscreenPreview() {
  const { slug } = useParams<{ slug: string }>();
  const splashRef = useRef<SplashCursorHandle>(null);
  const lastBurstRef = useRef<number>(0);
  const [showBanner, setShowBanner] = useState(true);

  // Trigger smooth fluid burst from the perimeter of the hovered element
  const handleImageHover = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (splashRef.current) {
      splashRef.current.burst(rect);
    }
  };

  // Throttled fluid wave when gliding across element
  const handleImageMove = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastBurstRef.current > 350) {
      lastBurstRef.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      if (splashRef.current) {
        splashRef.current.burst(rect);
      }
    }
  };

  const isSplashCursor = !slug || slug === 'splash-cursor' || slug === 'splash cursor';

  return (
    <div className="relative min-h-screen w-full bg-[#faf6ee] text-[#121c15] overflow-x-hidden selection:bg-[#121c15] selection:text-[#faf6ee]">
      {/* Floating CodeSpark Action Top Bar */}
      {showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-[#0D0F12]/90 text-white backdrop-blur-xl border border-[rgba(245,241,234,0.18)] shadow-2xl text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF4B32] animate-ping" />
            <span className="font-bold text-[#F5F1EA]">CodeSpark Full Live Demo</span>
          </div>
          <span className="text-white/30">•</span>
          <Link
            to={`/effects/${slug || 'splash-cursor'}`}
            className="flex items-center gap-1 font-bold text-[#FF4B32] hover:text-[#FF624B]"
          >
            <span>View Code & Docs</span>
            <i className="ri-arrow-right-line" />
          </Link>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-white/50 hover:text-white transition-colors"
            title="Dismiss top banner"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>
      )}

      {isSplashCursor ? (
        <>
          {/* Full-Screen WebGL Fluid Simulation Background */}
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

          {/* Interactive Showcase Hero Content */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 pt-8 pb-24">
            {/* Navigation Bar */}
            <header className="flex items-center justify-between py-4 mb-4">
              <nav className="flex items-center gap-6 sm:gap-8">
                <a
                  href="#listings"
                  className="font-serif italic text-lg sm:text-xl font-normal text-[#121c15] tracking-wide hover:opacity-70 transition-opacity"
                >
                  Listings
                </a>
                <a
                  href="#sell"
                  className="font-serif italic text-lg sm:text-xl font-normal text-[#121c15] tracking-wide hover:opacity-70 transition-opacity"
                >
                  Sell
                </a>
                <a
                  href="#about"
                  className="font-serif italic text-lg sm:text-xl font-normal text-[#121c15] tracking-wide hover:opacity-70 transition-opacity"
                >
                  About
                </a>
              </nav>

              {/* Brand Logo */}
              <div className="flex flex-col items-center select-none cursor-pointer">
                <svg
                  className="w-6 h-6 text-[#121c15] mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c0-5.523 0-8.5 0-11m0 0C12 6.5 8.5 3 3.5 3c0 4.5 3.5 8 8.5 8zm0 0c0-4.5 3.5-8 8.5-8 0 4.5-3.5 8-8.5 8z" />
                </svg>
                <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#121c15]">
                  Green Vale
                </span>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onMouseEnter={handleImageHover}
                  className="px-6 py-2 rounded-full border border-[#121c15] text-[#121c15] text-sm font-medium hover:bg-[#121c15] hover:text-[#faf6ee] transition-all duration-300 active:scale-95 shadow-sm cursor-pointer"
                >
                  Contact Us
                </button>
              </div>
            </header>

            {/* Title Section */}
            <div className="text-center my-6 sm:my-10">
              <h1 className="font-serif font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] tracking-tight leading-none text-[#0d1810] select-none uppercase">
                Green Vale
              </h1>
              <p className="font-serif italic font-normal text-xl sm:text-2xl md:text-3xl text-[#1a291f] tracking-wide mt-3 mb-10 sm:mb-14">
                Your Next Home is Here
              </p>
            </div>

            {/* Interactive Image Grid with Perimeter Bursts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-start">
              {/* Left Tall Image */}
              <div className="w-full">
                <div
                  onMouseEnter={handleImageHover}
                  onMouseMove={handleImageMove}
                  className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#ede6d8] aspect-[3/4] max-h-[640px] cursor-pointer group transition-all duration-500 hover:shadow-purple-500/20"
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
                    alt="Bright sunlit living interior"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col justify-between h-full">
                <div
                  onMouseEnter={handleImageHover}
                  onMouseMove={handleImageMove}
                  className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#ede6d8] aspect-[16/10] max-h-[340px] cursor-pointer group transition-all duration-500 hover:shadow-cyan-500/20"
                >
                  <img
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85"
                    alt="Modern warm kitchen"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                  />
                </div>

                <div className="mt-8 sm:mt-10 lg:mt-12">
                  <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-tight uppercase text-[#0d1810] mb-4">
                    Who We Are
                  </h2>
                  <p className="text-[#324336] text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                    Glide and move your cursor anywhere across the screen to experience the real-time Navier–Stokes fluid simulation.
                    Hovering and moving over the images triggers dynamic outward perimeter splashes!
                  </p>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={handleImageHover}
                      className="px-6 py-3 rounded-full bg-[#121c15] text-[#faf6ee] text-sm font-semibold tracking-wide hover:bg-black active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      Trigger Fluid Burst ⚡
                    </button>
                    <Link
                      to={`/effects/${slug || 'splash-cursor'}`}
                      className="inline-flex items-center gap-2 font-serif italic text-lg text-[#0d1810] font-medium border-b border-[#0d1810] pb-1 hover:opacity-75 transition-opacity"
                    >
                      Back to CodeSpark →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Fallback for other effects */
        <div className="min-h-screen flex items-center justify-center p-8">
          {EFFECT_REGISTRY[slug || ''] ? (
            React.createElement(EFFECT_REGISTRY[slug || ''])
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Preview not found</h2>
              <Link to="/effects" className="mt-4 inline-block text-[#FF4D2E] underline">
                Return to library
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
