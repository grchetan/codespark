import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';

export default function Navbar() {
  const { user, logout, isLoggingOut, isStaff, isSuperAdmin, isAuthenticated } = useAuth();
  const { savedCount } = useSaved();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Active mega menu state: 'effects' | 'categories' | null
  const [activeMegaMenu, setActiveMegaMenu] = useState<'effects' | 'categories' | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close all menus and mega menus on route change
  useEffect(() => {
    setOpen(false);
    setUserDropdown(false);
    setActiveMegaMenu(null);
  }, [location.pathname]);

  // Click outside to close user dropdown & mega menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close any open popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdown(false);
        setOpen(false);
        setActiveMegaMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth hover handlers for Mega-Menu with 180ms grace delay
  const handleMouseEnterMenu = (menu: 'effects' | 'categories') => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setActiveMegaMenu(menu);
  };

  const handleMouseLeaveMenu = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const handleLogout = async () => {
    if (loggingOut || isLoggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setUserDropdown(false);
      setOpen(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const isEffectsRoute = location.pathname.startsWith('/effects');
  const isCommunityRoute = location.pathname.startsWith('/community');
  const isAboutRoute = location.pathname.startsWith('/about');
  const isSavedRoute = location.pathname.startsWith('/saved');

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full pt-3 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <div ref={navContainerRef} className="max-w-7xl mx-auto flex items-center justify-between gap-3 pointer-events-auto relative">
        
        {/* ========================================================================= */}
        {/* 1. LEFT UTILITY BUTTON (Floating circle like Delta Cafes left audio pill) */}
        {/* ========================================================================= */}
        <div className="hidden md:flex items-center">
          <Link
            to="/effects"
            title="Explore Interactive Effects Library"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#12151A]/95 border border-[rgba(245,241,234,0.12)] shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-[#FF4B32]/50 hover:bg-[#171A20] hover:scale-105"
          >
            <i className="ri-sparkling-fill text-[#FF4B32] text-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="sr-only">Browse Effects</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. CENTER FLOATING CAPSULE BAR (Delta Cafes Style with Red/Orange Triangle) */}
        {/* ========================================================================= */}
        <nav
          className={`flex-1 md:flex-initial mx-auto flex items-center justify-between md:justify-center rounded-full bg-[#12151A]/95 border border-[rgba(245,241,234,0.12)] px-3 sm:px-5 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300 ${
            scrolled ? 'border-[rgba(245,241,234,0.18)] bg-[#0D0F12]/95' : ''
          }`}
        >
          {/* Mobile Left Logo Branding (Visible only on mobile screens) */}
          <Link to="/" className="flex items-center gap-2 md:hidden group py-1 pl-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4B32] text-white shadow-[0_0_12px_rgba(255,75,50,0.6)]">
              <i className="ri-sparkling-fill text-xs" />
            </span>
            <span className="font-display font-black text-sm tracking-widest text-[#F5F1EA]">
              CODESPARK
            </span>
          </Link>

          {/* Desktop Left Group of Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 mr-3 lg:mr-4">
            {/* EFFECTS Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnterMenu('effects')}
              onMouseLeave={handleMouseLeaveMenu}
            >
              <button
                type="button"
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'effects' ? null : 'effects')}
                className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeMegaMenu === 'effects' || isEffectsRoute
                    ? 'border border-[rgba(245,241,234,0.22)] bg-white/10 text-[#F5F1EA] shadow-xs'
                    : 'text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5'
                }`}
              >
                <span>Effects</span>
                <i
                  className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${
                    activeMegaMenu === 'effects' ? 'rotate-180 text-[#FF4B32]' : 'text-[#918A80]'
                  }`}
                />
              </button>
            </div>

            {/* CATEGORIES Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnterMenu('categories')}
              onMouseLeave={handleMouseLeaveMenu}
            >
              <button
                type="button"
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'categories' ? null : 'categories')}
                className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeMegaMenu === 'categories'
                    ? 'border border-[rgba(245,241,234,0.22)] bg-white/10 text-[#F5F1EA] shadow-xs'
                    : 'text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5'
                }`}
              >
                <span>Categories</span>
                <i
                  className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${
                    activeMegaMenu === 'categories' ? 'rotate-180 text-[#FF4B32]' : 'text-[#918A80]'
                  }`}
                />
              </button>
            </div>

            {/* COMMUNITY Direct Link */}
            <Link
              to="/community"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isCommunityRoute
                  ? 'border border-[rgba(245,241,234,0.22)] bg-white/10 text-[#F5F1EA]'
                  : 'text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5'
              }`}
            >
              Community
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* CENTER ICONIC TRIANGLE BADGE (Delta Cafes Style Upward Apex Emblem)       */}
          {/* ========================================================================= */}
          <div className="hidden md:flex items-center justify-center px-1">
            <Link
              to="/"
              title="CodeSpark Home"
              className="group relative -my-4 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 focus:outline-none"
            >
              {/* Outer triangle container with apex rising above navbar capsule */}
              <div className="relative h-13 w-16 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 86.6"
                  className="h-full w-full drop-shadow-[0_6px_16px_rgba(255,75,50,0.55)] transition-all duration-300 group-hover:drop-shadow-[0_8px_22px_rgba(255,75,50,0.75)]"
                >
                  <polygon
                    points="50,0 100,86.6 0,86.6"
                    fill="#FF4B32"
                    stroke="rgba(245,241,234,0.18)"
                    strokeWidth="2"
                  />
                </svg>

                {/* Brand label & Spark inside triangle */}
                <div className="absolute inset-x-0 bottom-1.5 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <i className="ri-sparkling-fill text-white text-[10px] leading-none mb-0.5" />
                  <span className="font-display font-black text-[7.5px] leading-none tracking-widest text-[#FAF6EE] uppercase">
                    CODESPARK
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Right Group of Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 ml-3 lg:ml-4">
            {/* DOCS Link */}
            <Link
              to="/about"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isAboutRoute
                  ? 'border border-[rgba(245,241,234,0.22)] bg-white/10 text-[#F5F1EA]'
                  : 'text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5'
              }`}
            >
              Docs
            </Link>

            {/* SAVED Link with live counter */}
            <Link
              to="/saved"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isSavedRoute
                  ? 'border border-[rgba(245,241,234,0.22)] bg-white/10 text-[#F5F1EA]'
                  : 'text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5'
              }`}
            >
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4B32] px-1 text-[9px] font-bold text-white shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* ABOUT Link */}
            <Link
              to="/about"
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8C2B9] hover:text-[#F5F1EA] hover:bg-white/5 transition-colors"
            >
              About
            </Link>

            {/* Master Console Pill (Staff only) */}
            {isStaff && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
                  isSuperAdmin
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-[#FF4B32]/10 text-[#FF4B32] border-[#FF4B32]/30 hover:bg-[#FF4B32]/20'
                }`}
              >
                <i className={isSuperAdmin ? 'ri-vip-crown-fill text-amber-400 text-xs' : 'ri-shield-check-line text-xs'} />
                <span>{isSuperAdmin ? 'Console' : 'Admin'}</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls: Saved & Hamburger Drawer */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              to="/saved"
              title="Saved Effects"
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#EDE8DF]"
            >
              <i className="ri-bookmark-line text-sm" />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#FF4B32] px-0.5 text-[8px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation drawer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#F5F1EA]"
            >
              <i className={open ? 'ri-close-line text-lg' : 'ri-menu-line text-lg'} />
            </button>
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* 3. RIGHT UTILITY BUTTONS (Profile Capsule + Submit CTA like Delta right)  */}
        {/* ========================================================================= */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdown((v) => !v)}
                className="flex h-11 items-center gap-2 rounded-full bg-[#12151A]/95 border border-[rgba(245,241,234,0.12)] px-3 py-1 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[rgba(245,241,234,0.25)] transition-all"
                aria-expanded={userDropdown}
                aria-haspopup="true"
              >
                <img
                  src={
                    user.avatar && !user.avatar.includes('unsplash')
                      ? user.avatar
                      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                  }
                  alt={user.name}
                  className={`h-7 w-7 rounded-full border bg-[#171A20] object-cover ${
                    isSuperAdmin ? 'border-amber-400' : 'border-[rgba(245,241,234,0.22)]'
                  }`}
                />
                <span className="text-xs font-semibold text-[#EDE8DF] max-w-[90px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <i className={`ri-arrow-down-s-line text-xs text-[#918A80] transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdown && (
                <div className="absolute right-0 top-13 w-64 rounded-2xl border border-[rgba(245,241,234,0.14)] bg-[#171A20] p-2.5 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in text-[#F5F1EA]">
                  <div className="border-b border-[rgba(245,241,234,0.1)] px-3 py-2.5">
                    <p className="font-bold text-[#F5F1EA] text-sm truncate">{user.name}</p>
                    <p className="text-xs text-[#918A80] truncate">{user.email}</p>
                    <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                      isSuperAdmin
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : user.role === 'admin'
                          ? 'bg-[#FF4B32]/15 text-[#FF4B32] border-[#FF4B32]/30'
                          : 'bg-white/5 text-[#C8C2B9] border-[rgba(245,241,234,0.12)]'
                    }`}>
                      {isSuperAdmin && <i className="ri-vip-crown-fill text-amber-400 text-[9px]" />}
                      {isSuperAdmin ? 'Super Admin (Owner)' : user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#F5F1EA] hover:bg-white/5 transition-colors"
                      >
                        <i className="ri-shield-keyhole-line text-[#FF4B32] text-sm" /> Control Center
                      </Link>
                    )}
                    <Link
                      to="/saved"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <i className="ri-bookmark-line text-sm text-[#FF4B32]" /> Saved Collection
                      </span>
                      {savedCount > 0 && (
                        <span className="rounded-full bg-[#FF4B32]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#FF4B32]">
                          {savedCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/submit"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <i className="ri-add-circle-line text-sm text-[#FF4B32]" /> Create Effect
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <i className="ri-team-line text-sm text-[#FF624B]" /> Community
                    </Link>
                  </div>

                  <div className="border-t border-[rgba(245,241,234,0.1)] pt-1">
                    <button
                      type="button"
                      disabled={loggingOut || isLoggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#FF4B32] hover:bg-[#FF4B32]/10 text-left disabled:opacity-50 transition-colors"
                    >
                      {loggingOut || isLoggingOut ? (
                        <>
                          <i className="ri-loader-4-line animate-spin text-sm" />
                          <span>Signing out...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-logout-box-r-line text-sm" />
                          <span>Sign out</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-11 items-center gap-1.5 rounded-full bg-[#12151A]/95 border border-[rgba(245,241,234,0.14)] px-4 text-xs font-semibold text-[#EDE8DF] shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[rgba(245,241,234,0.25)] hover:text-[#F5F1EA] transition-all"
            >
              <i className="ri-user-line text-sm text-[#FF4B32]" />
              <span>Sign in</span>
            </Link>
          )}

          {/* Submit Effect Button */}
          <Link
            to="/submit"
            className="flex h-11 items-center gap-1.5 rounded-full bg-[#FF4B32] px-4.5 text-xs font-bold uppercase tracking-wider text-[#FAF6EE] shadow-[0_8px_20px_rgba(255,75,50,0.4)] hover:bg-[#FF624B] hover:shadow-[0_10px_25px_rgba(255,75,50,0.6)] hover:scale-[1.02] transition-all"
          >
            <i className="ri-add-line text-sm" />
            <span>Submit</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4. MEGA-MENU DROPDOWN CARD (Delta Cafes Style with 3 Cards & Socials)      */}
        {/* ========================================================================= */}
        {activeMegaMenu && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-full max-w-5xl rounded-3xl bg-[#14171D]/98 border border-[rgba(245,241,234,0.14)] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => handleMouseEnterMenu(activeMegaMenu)}
            onMouseLeave={handleMouseLeaveMenu}
          >
            {activeMegaMenu === 'effects' ? (
              /* EFFECTS MEGA PANEL */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Editorial Column */}
                <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(245,241,234,0.08)] pb-6 lg:pb-0 lg:pr-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#FF4B32] uppercase">
                      COLLECTION SHOWCASE
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#F5F1EA] tracking-tight leading-[0.95] mt-2">
                      FEATURED<br />EFFECTS
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-[#C8C2B9] leading-relaxed">
                      GPU-accelerated fluid simulations, magnetic cursors, and physics-driven micro-interactions ready to copy into your codebase.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/effects"
                      onClick={() => setActiveMegaMenu(null)}
                      className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4B32] hover:text-[#FF624B] transition-colors"
                    >
                      <span>Explore All 20+ Effects</span>
                      <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Right 3 Visual Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Fluid Splash Cursor */}
                  <Link
                    to="/effects?q=splash"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-3 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950/60 via-purple-950/50 to-orange-950/40 border border-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                        alt="Fluid Splash Cursor"
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                        WebGL • Fluid
                      </span>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors">
                        Fluid Splash Cursor
                      </h3>
                      <p className="text-[11px] text-[#918A80] mt-0.5 line-clamp-1">
                        Navier-Stokes fluid solver
                      </p>
                    </div>
                  </Link>

                  {/* Card 2: 3D Tilt Card */}
                  <Link
                    to="/effects?q=tilt"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-3 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 via-stone-900 to-amber-950/30 border border-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80"
                        alt="3D Tilt Card"
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                        3D • Depth
                      </span>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors">
                        3D Tilt Card
                      </h3>
                      <p className="text-[11px] text-[#918A80] mt-0.5 line-clamp-1">
                        Spatial rotation & glare
                      </p>
                    </div>
                  </Link>

                  {/* Card 3: Cursor Spotlight */}
                  <Link
                    to="/effects?q=spotlight"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-3 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800 border border-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
                        alt="Cursor Spotlight"
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                        Mouse • Glow
                      </span>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors">
                        Cursor Spotlight Glow
                      </h3>
                      <p className="text-[11px] text-[#918A80] mt-0.5 line-clamp-1">
                        Radial reveal illumination
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              /* CATEGORIES MEGA PANEL */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Editorial Column */}
                <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(245,241,234,0.08)] pb-6 lg:pb-0 lg:pr-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#FF4B32] uppercase">
                      SYSTEM TAXONOMY
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#F5F1EA] tracking-tight leading-[0.95] mt-2">
                      BROWSE<br />CATEGORIES
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-[#C8C2B9] leading-relaxed">
                      Filter components by interaction mechanics — hover states, kinetic typography, 3D space, and organic loaders.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/effects"
                      onClick={() => setActiveMegaMenu(null)}
                      className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4B32] hover:text-[#FF624B] transition-colors"
                    >
                      <span>View Categories Index</span>
                      <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Right 3 Visual Category Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category 1: Hover & Pointer */}
                  <Link
                    to="/effects?category=cursor"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-4 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4B32]/10 text-[#FF4B32] border border-[#FF4B32]/20 mb-3 group-hover:scale-110 transition-transform">
                      <i className="ri-cursor-line text-lg" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#918A80]">
                      Micro-Interactions
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors mt-0.5">
                      Cursor & Hover Dynamics
                    </h3>
                    <p className="text-[11px] text-[#C8C2B9] mt-2 leading-relaxed">
                      Magnetic pulls, spot trails, elastic pointers, and boundary reveals.
                    </p>
                  </Link>

                  {/* Category 2: 3D & Depth */}
                  <Link
                    to="/effects?category=3d"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-4 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                      <i className="ri-box-3-line text-lg" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#918A80]">
                      WebGL & CSS Spatial
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors mt-0.5">
                      3D Perspective & Depth
                    </h3>
                    <p className="text-[11px] text-[#C8C2B9] mt-2 leading-relaxed">
                      Perspective tilts, parallax grids, isometric cards, and spatial physics.
                    </p>
                  </Link>

                  {/* Category 3: Typography & Motion */}
                  <Link
                    to="/effects?category=text"
                    onClick={() => setActiveMegaMenu(null)}
                    className="group flex flex-col rounded-2xl bg-[#0D0F12]/80 border border-[rgba(245,241,234,0.1)] p-4 transition-all duration-300 hover:border-[#FF4B32]/40 hover:bg-[#171A20]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 group-hover:scale-110 transition-transform">
                      <i className="ri-font-size text-lg" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#918A80]">
                      Shaders & Kinetic
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#F5F1EA] group-hover:text-[#FF4B32] transition-colors mt-0.5">
                      Text & Kinetic Shaders
                    </h3>
                    <p className="text-[11px] text-[#C8C2B9] mt-2 leading-relaxed">
                      Scramble decoders, wavy headlines, aurora loaders, and kinetic loops.
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Footer Strip with Socials (Delta Cafes Style) */}
            <div className="mt-8 pt-5 border-t border-[rgba(245,241,234,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Social Round Buttons */}
              <div className="flex items-center gap-2.5">
                <a
                  href="https://github.com/grchetan/codespark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(245,241,234,0.12)] bg-white/5 text-[#C8C2B9] hover:text-[#FF4B32] hover:border-[#FF4B32]/40 transition-colors"
                  aria-label="GitHub Repository"
                >
                  <i className="ri-github-fill text-sm" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(245,241,234,0.12)] bg-white/5 text-[#C8C2B9] hover:text-[#FF4B32] hover:border-[#FF4B32]/40 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <i className="ri-twitter-x-fill text-sm" />
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(245,241,234,0.12)] bg-white/5 text-[#C8C2B9] hover:text-[#FF4B32] hover:border-[#FF4B32]/40 transition-colors"
                  aria-label="Discord Community"
                >
                  <i className="ri-discord-fill text-sm" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(245,241,234,0.12)] bg-white/5 text-[#C8C2B9] hover:text-[#FF4B32] hover:border-[#FF4B32]/40 transition-colors"
                  aria-label="LinkedIn"
                >
                  <i className="ri-linkedin-fill text-sm" />
                </a>
              </div>

              {/* Copyright Notice */}
              <span className="text-xs text-[#918A80] font-medium tracking-wide">
                2026 © CodeSpark • Creative Motion Library
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MOBILE DRAWER MENU (Clean Dark Cinematic Drawer - No Search Bar)       */}
      {/* ========================================================================= */}
      {open && (
        <div className="fixed inset-x-3 top-18 z-50 rounded-3xl bg-[#0D0F12]/98 border border-[rgba(245,241,234,0.14)] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:hidden max-h-[82vh] overflow-y-auto pointer-events-auto text-[#F5F1EA] animate-in fade-in slide-in-from-top-3 duration-200">
          {/* User card if logged in */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#171A20] p-3 mb-4 border border-[rgba(245,241,234,0.12)]">
              <img
                src={
                  user.avatar && !user.avatar.includes('unsplash')
                    ? user.avatar
                    : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                }
                alt={user.name}
                className={`h-10 w-10 rounded-full object-cover border bg-[#12151A] ${
                  isSuperAdmin ? 'border-amber-400' : 'border-[rgba(245,241,234,0.22)]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#F5F1EA] truncate">{user.name}</p>
                <p className="text-xs text-[#918A80] truncate">{user.email}</p>
              </div>
              <span className="rounded-full bg-[#FF4B32]/15 text-[#FF4B32] border border-[#FF4B32]/30 px-2 py-0.5 text-[9px] font-black uppercase">
                {isSuperAdmin ? 'Super Admin' : user.role}
              </span>
            </div>
          )}

          {/* Navigation Links List */}
          <div className="flex flex-col space-y-1">
            <Link
              to="/effects"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isEffectsRoute
                  ? 'bg-[#FF4B32]/15 text-[#FF4B32] border border-[#FF4B32]/30'
                  : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'
              }`}
            >
              <span>Effects Library</span>
              <i className="ri-arrow-right-s-line text-lg text-[#918A80]" />
            </Link>

            <Link
              to="/saved"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isSavedRoute
                  ? 'bg-[#FF4B32]/15 text-[#FF4B32] border border-[#FF4B32]/30'
                  : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>Saved Effects</span>
                {savedCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4B32] px-1 text-[9px] font-bold text-white">
                    {savedCount}
                  </span>
                )}
              </span>
              <i className="ri-arrow-right-s-line text-lg text-[#918A80]" />
            </Link>

            <Link
              to="/community"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isCommunityRoute
                  ? 'bg-[#FF4B32]/15 text-[#FF4B32] border border-[#FF4B32]/30'
                  : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'
              }`}
            >
              <span>Community</span>
              <i className="ri-arrow-right-s-line text-lg text-[#918A80]" />
            </Link>

            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isAboutRoute
                  ? 'bg-[#FF4B32]/15 text-[#FF4B32] border border-[#FF4B32]/30'
                  : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'
              }`}
            >
              <span>About & Docs</span>
              <i className="ri-arrow-right-s-line text-lg text-[#918A80]" />
            </Link>

            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
            >
              <span>Contact</span>
              <i className="ri-arrow-right-s-line text-lg text-[#918A80]" />
            </Link>

            {isStaff && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold bg-[#FF4B32]/10 text-[#FF4B32] border border-[#FF4B32]/25 mt-1"
              >
                <span className="flex items-center gap-2">
                  <i className="ri-shield-keyhole-line" />
                  <span>Control Center</span>
                </span>
                <i className="ri-arrow-right-s-line text-lg" />
              </Link>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-[rgba(245,241,234,0.12)] space-y-2.5">
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF4B32] text-sm font-bold uppercase tracking-wider text-[#FAF6EE] shadow-lg hover:bg-[#FF624B] transition-colors"
            >
              <i className="ri-add-line text-lg" /> Submit an Effect
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                disabled={loggingOut || isLoggingOut}
                onClick={handleLogout}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#FF4B32]/30 bg-[#FF4B32]/5 text-sm font-semibold text-[#FF4B32] hover:bg-[#FF4B32]/15 disabled:opacity-50 transition-colors"
              >
                {loggingOut || isLoggingOut ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-lg" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-logout-box-r-line text-lg" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(245,241,234,0.22)] bg-white/5 text-sm font-semibold text-[#EDE8DF] hover:bg-white/10 transition-colors"
              >
                <i className="ri-user-line text-lg text-[#FF4B32]" /> Sign in to CodeSpark
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}