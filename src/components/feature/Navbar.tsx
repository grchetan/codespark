import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Effects', to: '/effects' },
  { label: 'Saved', to: '/saved' },
  { label: 'Community', to: '/community' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { user, logout, isLoggingOut, isStaff, isSuperAdmin, isAuthenticated } = useAuth();
  const { savedCount } = useSaved();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  // Focus mobile search on open
  useEffect(() => {
    if (searchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [searchOpen]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close all popups & menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdown(false);
        setOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/effects?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/effects');
    }
    setSearchOpen(false);
    setOpen(false);
    setSearchTerm('');
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

  // High-contrast tokens for CodeSpark cinematic navbar
  const logoTextClass = 'text-[#F5F1EA]';
  const logoBorderClass = 'border-[rgba(245,241,234,0.22)] bg-[#171A20] text-[#F5F1EA]';
  const actionIconClass = 'text-[#EDE8DF] hover:text-[#F5F1EA]';
  const mobileToggleClass = 'text-[#F5F1EA]';
  const navLinkInactive = 'text-[#BDB6AC] hover:text-[#F5F1EA]';
  const navLinkActive = 'text-primary-500 font-bold';

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full max-w-full border-b border-[rgba(245,241,234,0.12)] bg-[#0D0F12]/95 backdrop-blur-md shadow-xs transition-all duration-300">
      {/* Top Main Navbar Row */}
      <nav className="container-x flex h-16 w-full items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 group" aria-label="CodeSpark home">
          <span className={`grid h-8 w-8 place-items-center rounded-full border ${logoBorderClass} text-sm transition-all group-hover:border-primary-500/60`}>
            <i className="ri-sparkling-2-fill text-primary-500" />
          </span>
          <span className={`font-display text-lg sm:text-xl font-bold tracking-wider ${logoTextClass} transition-colors group-hover:text-primary-400`}>
            CODESPARK
          </span>
        </Link>

        {/* Desktop Search Bar (Centered) */}
        <div className="hidden flex-1 items-center justify-center md:flex max-w-md mx-4 min-w-0">
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-2 rounded-full border border-[rgba(245,241,234,0.14)] bg-[#171A20] px-4 py-2 transition-all focus-within:border-primary-500/80 focus-within:bg-[#1A1E24]"
          >
            <i className="ri-search-line text-sm shrink-0 text-[#BDB6AC]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search effects, tags, categories..."
              className="w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none text-[#F5F1EA] placeholder:text-[#918A80]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-[#918A80] hover:text-[#F5F1EA] shrink-0">
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </form>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Saved Collection Quick Button */}
          <Link
            to="/saved"
            title="Saved Components"
            className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/5 ${actionIconClass}`}
          >
            <i className="ri-bookmark-line text-lg" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white shadow-sm animate-fade-in">
                {savedCount}
              </span>
            )}
          </Link>

          {isStaff && (
            <Link
              to="/admin"
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold border transition-all ${
                isSuperAdmin
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                  : 'bg-primary-500/10 text-primary-400 border-primary-500/30 hover:bg-primary-500/20'
              }`}
            >
              <i className={isSuperAdmin ? 'ri-vip-crown-fill text-amber-400 text-sm' : 'ri-shield-check-line text-sm'} />
              <span>{isSuperAdmin ? 'Master Console' : user?.role === 'admin' ? 'Admin' : 'Moderation'}</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdown((v) => !v)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/5 focus:outline-none"
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
                  className={`h-8 w-8 rounded-full border bg-[#171A20] object-cover ${
                    isSuperAdmin ? 'border-amber-400 shadow-sm' : 'border-[rgba(245,241,234,0.22)]'
                  }`}
                />
                <i className={`ri-arrow-down-s-line text-xs ${actionIconClass}`} />
              </button>

              {userDropdown && (
                <div className="absolute right-0 top-12 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[rgba(245,241,234,0.14)] bg-[#171A20] p-2 shadow-2xl backdrop-blur-xl z-50 animate-fade-in text-[#F5F1EA]">
                  <div className="border-b border-[rgba(245,241,234,0.1)] px-3 py-2.5">
                    <p className="font-bold text-[#F5F1EA] text-sm truncate">{user.name}</p>
                    <p className="text-xs text-[#918A80] truncate">{user.email}</p>
                    <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                      isSuperAdmin
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : user.role === 'admin'
                          ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                          : user.role === 'moderator'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
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
                        <i className="ri-shield-keyhole-line text-primary-500 text-sm" /> Control Center
                      </Link>
                    )}
                    <Link
                      to="/saved"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <i className="ri-bookmark-line text-sm text-primary-500" /> Saved Collection
                      </span>
                      {savedCount > 0 && (
                        <span className="rounded-full bg-primary-500/20 px-1.5 py-0.2 text-[10px] font-bold text-primary-400">
                          {savedCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/submit"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <i className="ri-add-circle-line text-sm text-primary-500" /> Create Effect
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA] transition-colors"
                    >
                      <i className="ri-team-line text-sm text-accent-400" /> Community
                    </Link>
                  </div>

                  <div className="border-t border-[rgba(245,241,234,0.1)] pt-1">
                    <button
                      type="button"
                      disabled={loggingOut || isLoggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary-400 hover:bg-primary-500/10 text-left disabled:opacity-50 transition-colors"
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
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold border border-[rgba(245,241,234,0.22)] text-[#EDE8DF] hover:bg-white/5 hover:border-primary-500/70 hover:text-[#F5F1EA] transition-all"
            >
              <i className="ri-user-line text-sm" /> Sign in
            </Link>
          )}

          <Link
            to="/submit"
            className="btn btn-primary h-9 px-4 text-xs font-semibold bg-primary-500 text-[#FAF6EE] hover:bg-primary-400 shadow-sm whitespace-nowrap hidden sm:inline-flex"
          >
            <i className="ri-add-line text-sm" /> Submit
          </Link>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
            className={`grid h-9 w-9 place-items-center rounded-lg ${actionIconClass}`}
          >
            <i className="ri-search-line text-lg" />
          </button>

          <Link
            to="/saved"
            aria-label="Saved effects"
            className={`relative grid h-9 w-9 place-items-center rounded-lg ${actionIconClass}`}
          >
            <i className="ri-bookmark-line text-lg" />
            {savedCount > 0 && (
              <span className="absolute 1 top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-500 px-1 text-[9px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className={`grid h-9 w-9 place-items-center rounded-lg ${mobileToggleClass}`}
          >
            <i className={open ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'} />
          </button>
        </div>
      </nav>

      {/* Mobile Search Dropdown Bar */}
      {searchOpen && (
        <div className="border-b border-[rgba(245,241,234,0.12)] bg-[#0D0F12] px-4 py-3 md:hidden animate-fade-in shadow-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-[rgba(245,241,234,0.14)] bg-[#171A20] px-3 py-2">
            <i className="ri-search-line text-sm text-[#BDB6AC] shrink-0" />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Search components..."
              className="w-full bg-transparent text-xs outline-none text-[#F5F1EA] placeholder:text-[#918A80]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-[#918A80] hover:text-[#F5F1EA]">
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Desktop Secondary Sub-Nav for Links */}
      <div className="hidden md:block border-t border-[rgba(245,241,234,0.1)] bg-[#0D0F12]/80 backdrop-blur-sm transition-colors">
        <div className="container-x flex h-10 items-center justify-center gap-6 text-xs uppercase tracking-wider font-semibold">
          {navLinks.map((l) => {
            const active = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative py-2.5 transition-colors ${
                  active ? navLinkActive : navLinkInactive
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="w-full border-t border-[rgba(245,241,234,0.14)] bg-[#0D0F12] px-5 py-5 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto text-[#F5F1EA]">
          {/* User status card if logged in */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#171A20] p-3.5 mb-4 border border-[rgba(245,241,234,0.14)]">
              <img
                src={
                  user.avatar && !user.avatar.includes('unsplash')
                    ? user.avatar
                    : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                }
                alt={user.name}
                className={`h-10 w-10 rounded-full object-cover border bg-[#12151A] ${
                  isSuperAdmin ? 'border-amber-400 shadow-sm' : 'border-[rgba(245,241,234,0.22)]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#F5F1EA] truncate">{user.name}</p>
                <p className="text-xs text-[#918A80] truncate">{user.email}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                isSuperAdmin
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : user.role === 'admin'
                    ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                    : user.role === 'moderator'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : 'bg-white/5 text-[#C8C2B9] border-[rgba(245,241,234,0.12)]'
              }`}>
                {isSuperAdmin ? 'Super Admin' : user.role}
              </span>
            </div>
          )}

          {/* Links list */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((l) => {
              const active = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-[#C8C2B9] hover:bg-white/5 hover:text-[#F5F1EA]'
                  }`}
                >
                  <span>{l.label}</span>
                  <i className={`ri-arrow-right-s-line text-lg ${active ? 'text-primary-500' : 'text-[#918A80]'}`} />
                </Link>
              );
            })}

            {isStaff && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold border transition-all ${
                  isSuperAdmin
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <i className={isSuperAdmin ? 'ri-vip-crown-fill text-amber-400' : 'ri-shield-keyhole-line'} />
                  <span>{isSuperAdmin ? 'Master Control Center' : 'Admin Control Center'}</span>
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
              className="btn btn-primary h-12 w-full text-sm font-semibold shadow-md flex items-center justify-center gap-2 bg-primary-500 text-[#FAF6EE] hover:bg-primary-400"
            >
              <i className="ri-add-circle-line text-lg" /> Submit an Effect
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                disabled={loggingOut || isLoggingOut}
                onClick={handleLogout}
                className="btn h-11 w-full text-sm font-semibold text-primary-400 border border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/15 disabled:opacity-50 flex items-center justify-center gap-2 rounded-lg transition-colors"
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
                className="btn h-11 w-full text-sm flex items-center justify-center gap-2 border border-[rgba(245,241,234,0.22)] text-[#EDE8DF] hover:bg-white/5 rounded-lg transition-colors"
              >
                <i className="ri-user-line text-lg" /> Sign in to CodeSpark
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}