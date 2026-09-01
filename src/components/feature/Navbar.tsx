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
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { savedCount } = useSaved();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const darkNav = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

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

  const logoTextClass = darkNav ? 'text-background-50' : 'text-foreground-950';
  const logoBorderClass = darkNav ? 'border-background-50/70 text-background-50' : 'border-foreground-950 text-foreground-950';
  const actionIconClass = darkNav ? 'text-background-400 hover:text-background-50' : 'text-foreground-600 hover:text-foreground-950';
  const mobileToggleClass = darkNav ? 'text-background-50' : 'text-foreground-950';
  const navLinkInactive = darkNav ? 'text-background-400 hover:text-background-50' : 'text-foreground-500 hover:text-foreground-950';
  const navLinkActive = darkNav ? 'text-background-50' : 'text-foreground-950';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full max-w-full transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-background-300/40 bg-background-50/95 backdrop-blur-xl shadow-sm'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      {/* Top Main Navbar Row */}
      <nav className="container-x flex h-16 w-full items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CodeSpark home">
          <span className={`grid h-8 w-8 place-items-center rounded-full border ${logoBorderClass} text-sm transition-colors`}>
            <i className="ri-sparkling-2-fill text-primary-500" />
          </span>
          <span className={`font-display text-lg sm:text-xl font-bold tracking-tight ${logoTextClass} transition-colors`}>
            CODESPARK
          </span>
        </Link>

        {/* Desktop Search Bar (Centered) */}
        <div className="hidden flex-1 items-center justify-center md:flex max-w-md mx-4 min-w-0">
          <form
            onSubmit={handleSearch}
            className={`flex w-full items-center gap-2 rounded-full border ${
              darkNav ? 'border-background-700 bg-background-950/60' : 'border-background-300/70 bg-background-100/70'
            } px-4 py-2 transition-colors focus-within:border-primary-400 focus-within:bg-background-50`}
          >
            <i className={`ri-search-line text-sm shrink-0 ${darkNav ? 'text-background-400' : 'text-foreground-400'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search effects, tags, categories..."
              className={`w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none ${
                darkNav ? 'text-background-50 placeholder:text-background-500' : 'text-foreground-950 placeholder:text-foreground-400'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-foreground-400 hover:text-foreground-700 shrink-0">
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
            className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-background-200/40 ${actionIconClass}`}
          >
            <i className="ri-bookmark-line text-lg" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white shadow-sm animate-fade-in">
                {savedCount}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 text-xs font-semibold text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <i className="ri-shield-check-line text-sm" /> Admin
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdown((v) => !v)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-background-200/40"
              >
                <img
                  src={
                    user.avatar && !user.avatar.includes('unsplash')
                      ? user.avatar
                      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || user.email || 'Chetan')}`
                  }
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-background-400 bg-background-100 object-cover"
                />
                <i className={`ri-arrow-down-s-line text-xs ${actionIconClass}`} />
              </button>

              {userDropdown && (
                <div className="absolute right-0 top-11 w-56 rounded-2xl border border-background-300/60 bg-background-50 p-2 shadow-xl backdrop-blur-xl z-50 animate-fade-in">
                  <div className="border-b border-background-300/40 px-3 py-2.5">
                    <p className="font-semibold text-foreground-950 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-foreground-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/10"
                      >
                        <i className="ri-shield-keyhole-line text-sm" /> Admin Console
                      </Link>
                    )}
                    <Link
                      to="/saved"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground-700 hover:bg-background-100 hover:text-foreground-950"
                    >
                      <span className="flex items-center gap-2.5">
                        <i className="ri-bookmark-line text-sm text-primary-500" /> Saved Collection
                      </span>
                      {savedCount > 0 && (
                        <span className="rounded-full bg-primary-500/15 px-1.5 py-0.2 text-[10px] font-bold text-primary-600">
                          {savedCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/submit"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground-700 hover:bg-background-100 hover:text-foreground-950"
                    >
                      <i className="ri-add-circle-line text-sm text-primary-500" /> Create Effect
                    </Link>
                    <Link
                      to="/community"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground-700 hover:bg-background-100 hover:text-foreground-950"
                    >
                      <i className="ri-team-line text-sm text-accent-600" /> Community
                    </Link>
                  </div>

                  <div className="border-t border-background-300/40 pt-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-500/10 text-left"
                    >
                      <i className="ri-logout-box-r-line text-sm" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-xs font-medium transition-all ${
                darkNav
                  ? 'border border-background-50/40 text-background-50 hover:bg-background-50/10'
                  : 'border border-foreground-950/20 text-foreground-950 hover:bg-foreground-950 hover:text-background-50'
              }`}
            >
              <i className="ri-user-line text-sm" /> Sign in
            </Link>
          )}

          <Link
            to="/submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-500 px-4 text-xs font-semibold uppercase tracking-wider text-background-50 shadow-sm transition-all hover:bg-primary-600"
          >
            <i className="ri-add-line text-sm" /> Submit
          </Link>
        </div>

        {/* Mobile Right Action Bar (Search Toggle + Hamburger) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-background-200/20 ${actionIconClass}`}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <i className={searchOpen ? 'ri-close-line text-lg' : 'ri-search-line text-lg'} />
          </button>

          {isAuthenticated && user && (
            <Link to="/submit" className="grid h-8 w-8 place-items-center rounded-full overflow-hidden border border-background-300 shrink-0">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'} alt="Avatar" className="h-full w-full object-cover" />
            </Link>
          )}

          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-background-200/20 ${mobileToggleClass}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <i className={open ? 'ri-close-line text-2xl text-primary-500' : 'ri-menu-3-line text-2xl'} />
          </button>
        </div>
      </nav>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="w-full border-t border-background-300/40 bg-background-50 px-4 py-3 md:hidden shadow-md">
          <form onSubmit={handleSearch} className="flex w-full items-center gap-2 rounded-full border border-background-400 bg-background-100 px-3.5 py-2">
            <i className="ri-search-line text-sm text-foreground-500 shrink-0" />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Search effects..."
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground-950 placeholder:text-foreground-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-foreground-500 shrink-0">
                <i className="ri-close-line text-base" />
              </button>
            )}
            <button type="submit" className="btn btn-primary h-7 px-3 text-xs rounded-full shrink-0">
              Go
            </button>
          </form>
        </div>
      )}

      {/* Desktop Navigation Links Row */}
      <div className={`hidden border-t md:block ${darkNav ? 'border-background-800/30' : 'border-background-300/30'}`}>
        <div className="container-x flex h-11 w-full items-center justify-center gap-1">
          {navLinks.map((l) => {
            const active = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active ? navLinkActive : navLinkInactive
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-5 bottom-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="w-full border-t border-background-300/40 bg-background-50 px-5 py-5 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto">
          {/* User status card if logged in */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 rounded-xl bg-background-100 p-3.5 mb-4 border border-background-300/60">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover border border-background-400"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground-950 truncate">{user.name}</p>
                <p className="text-xs text-foreground-500 truncate">{user.email}</p>
              </div>
              <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-600">
                {user.role}
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
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? 'bg-foreground-950 text-background-50' : 'text-foreground-700 hover:bg-background-100 hover:text-foreground-950'
                  }`}
                >
                  <span>{l.label}</span>
                  <i className={`ri-arrow-right-s-line text-lg ${active ? 'text-primary-500' : 'text-foreground-400'}`} />
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 border border-amber-500/20"
              >
                <span className="flex items-center gap-2">
                  <i className="ri-shield-keyhole-line text-lg" /> Admin Control Center
                </span>
                <i className="ri-arrow-right-s-line text-lg" />
              </Link>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-background-300/40 space-y-2.5">
            <Link
              to="/submit"
              className="btn btn-primary h-12 w-full text-sm font-semibold shadow-md"
            >
              <i className="ri-add-circle-line text-lg" /> Submit an Effect
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary h-11 w-full text-sm text-primary-600 border-primary-500/30 hover:bg-primary-500/10"
              >
                <i className="ri-logout-box-r-line text-lg" /> Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="btn btn-secondary h-11 w-full text-sm"
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