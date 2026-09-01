import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import EffectCard from '@/components/feature/EffectCard';
import Reveal from '@/components/base/Reveal';
import { useSaved } from '@/context/SavedContext';
import { categories } from '@/mocks/effects';

export default function SavedPage() {
  const { savedEffects, savedCount, clearAllSaved } = useSaved();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  // Available categories based on saved items
  const activeCategories = useMemo(() => {
    const counts: Record<string, number> = { all: savedEffects.length };
    savedEffects.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [savedEffects]);

  // Filter saved effects by category and search
  const filteredEffects = useMemo(() => {
    return savedEffects.filter((effect) => {
      const matchesCat = selectedCategory === 'all' || effect.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        effect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        effect.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        effect.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [savedEffects, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background-50 text-foreground-950 flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20 flex-1">
        <div className="container-x">
          {/* Header Banner */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-background-300/50 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-500/15 text-primary-600 text-sm font-bold">
                  <i className="ri-bookmark-fill" />
                </span>
                <p className="eyebrow text-primary-600">Personal Collection</p>
              </div>

              <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground-950">
                Saved Components
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-foreground-500 max-w-xl">
                Your private curated workspace. Quickly preview, customize, and copy code for all the UI motion effects you've bookmarked.
              </p>
            </div>

            {/* Quick Actions & Counter */}
            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <span className="rounded-full bg-background-200/80 px-3.5 py-1.5 text-xs font-bold text-foreground-700 border border-background-300">
                {savedCount} {savedCount === 1 ? 'Component' : 'Components'} Saved
              </span>

              {savedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <i className="ri-delete-bin-line" /> Clear All
                </button>
              )}

              <Link
                to="/effects"
                className="btn btn-primary h-9 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <i className="ri-compass-3-line" /> Explore Library
              </Link>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          {savedCount > 0 && (
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in saved components..."
                  className="input pl-10 pr-8 h-10 text-xs w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-xs"
                  >
                    <i className="ri-close-line" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`chip text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-foreground-950 text-background-50 font-bold shadow-sm'
                      : 'text-foreground-600 hover:bg-background-200/60'
                  }`}
                >
                  <span>All</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-background-300 text-foreground-700'
                  }`}>
                    {savedCount}
                  </span>
                </button>

                {categories.map((c) => {
                  const count = activeCategories[c.key] || 0;
                  if (count === 0 && selectedCategory !== c.key) return null;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedCategory(c.key)}
                      className={`chip text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        selectedCategory === c.key
                          ? 'bg-foreground-950 text-background-50 font-bold shadow-sm'
                          : 'text-foreground-600 hover:bg-background-200/60'
                      }`}
                    >
                      <i className={c.icon} />
                      <span>{c.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        selectedCategory === c.key ? 'bg-primary-500 text-white' : 'bg-background-300 text-foreground-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Effects Grid or Empty States */}
          {savedCount === 0 ? (
            <Reveal>
              <div className="my-12 rounded-3xl border border-dashed border-background-300 bg-background-100/40 p-12 text-center max-w-lg mx-auto">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary-500/10 text-3xl text-primary-500">
                  <i className="ri-bookmark-3-line" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground-950">
                  Your Collection is Empty
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-foreground-500 leading-relaxed">
                  Browse our gallery of interactive buttons, loaders, cards, and text animations. Click the bookmark icon on any effect to save it here!
                </p>
                <Link
                  to="/effects"
                  className="btn btn-primary mt-6 inline-flex h-10 px-5 text-xs font-bold items-center gap-2 shadow-md"
                >
                  <i className="ri-sparkling-fill" /> Explore UI Effects
                </Link>
              </div>
            </Reveal>
          ) : filteredEffects.length === 0 ? (
            <div className="my-12 rounded-3xl border border-background-300/60 bg-background-100/30 p-10 text-center max-w-md mx-auto">
              <i className="ri-search-2-line text-3xl text-foreground-400 mb-2 block" />
              <h4 className="font-display text-base font-bold text-foreground-950">
                No matching saved effects
              </h4>
              <p className="mt-1 text-xs text-foreground-500">
                Try changing your search query or category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn btn-secondary mt-4 h-8 px-3 text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEffects.map((effect, idx) => (
                <Reveal key={effect.id} delay={Math.min(idx * 40, 240)}>
                  <EffectCard effect={effect} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300/80 space-y-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-2xl text-rose-600">
              <i className="ri-delete-bin-line" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground-950">
                Clear Saved Collection?
              </h3>
              <p className="mt-1 text-xs text-foreground-600">
                Are you sure you want to remove all <strong>{savedCount}</strong> saved items from your personal collection?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="btn btn-secondary h-9 text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllSaved();
                  setShowClearModal(false);
                }}
                className="btn bg-rose-600 hover:bg-rose-700 text-white h-9 text-xs font-bold flex-1"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
