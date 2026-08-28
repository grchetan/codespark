import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import EffectCard from '@/components/feature/EffectCard';
import Reveal from '@/components/base/Reveal';
import { categories, effects as defaultEffects, type Effect } from '@/mocks/effects';

const difficulties = ['all', 'easy', 'medium', 'advanced'];

type SortKey = 'trending' | 'new' | 'popular' | 'name';

export default function EffectsPage() {
  const [params, setParams] = useSearchParams();
  const searchInput = useRef<HTMLInputElement | null>(null);

  const [allEffects, setAllEffects] = useState<Effect[]>(defaultEffects);
  const cat = params.get('cat') || 'all';
  const sort = (params.get('sort') as SortKey) || 'trending';
  const query = params.get('q') || params.get('search') || '';
  const [difficulty, setDifficulty] = useState('all');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    fetch('/api/effects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.effects) && data.effects.length > 0) {
          setAllEffects(data.effects);
        }
      })
      .catch(() => {
        // Fallback already in place
      });
  }, []);

  useEffect(() => {
    if (params.get('focus') === 'search') {
      setTimeout(() => searchInput.current?.focus(), 80);
      params.delete('focus');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const setQuery = (q: string) => {
    if (q) {
      params.set('q', q);
      params.delete('search');
    } else {
      params.delete('q');
      params.delete('search');
    }
    setParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = allEffects.filter((e) => (cat === 'all' ? true : e.category === cat));
    if (difficulty !== 'all') list = list.filter((e) => e.difficulty === difficulty);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.categoryLabel.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    if (sort === 'trending') sorted.sort((a, b) => b.likes - a.likes);
    else if (sort === 'new') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === 'popular') sorted.sort((a, b) => b.views - a.views);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [allEffects, cat, difficulty, query, sort]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 w-full max-w-full overflow-x-hidden">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">The library</p>
                <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground-950 md:text-5xl">
                  Discover effects
                </h1>
                <p className="mt-2 max-w-xl text-sm text-foreground-500 leading-relaxed">
                  {allEffects.length}+ effects, live previews, ready-to-copy code. Search by what you need — "cursor", "3D card", "loader".
                </p>
              </div>
              <span className="rounded-full border border-background-400 px-4 py-1.5 text-xs font-medium text-foreground-500">
                {filtered.length} results
              </span>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className={`relative flex items-center rounded-xl border transition-colors ${focused ? 'border-primary-400 ring-1 ring-primary-400/30' : 'border-background-400'} bg-background-50`}>
              <i className="ri-search-line pl-4 text-lg text-foreground-500" />
              <input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='Try "magnetic button", "text scramble", "3D card"…'
                className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground-950 placeholder:text-foreground-500 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="mr-2 grid h-8 w-8 place-items-center rounded-md text-foreground-500 hover:bg-background-200" aria-label="Clear search">
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <div className="flex items-center gap-1.5">
                <span className="hidden text-xs text-foreground-500 sm:block">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => { params.set('sort', e.target.value); setParams(params, { replace: true }); }}
                  className="input !w-auto cursor-pointer rounded-xl"
                >
                  <option value="trending">Trending</option>
                  <option value="new">Newest</option>
                  <option value="popular">Most viewed</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => { if (c.key === 'all') params.delete('cat'); else params.set('cat', c.key); setParams(params, { replace: true }); }}
                className={`chip ${cat === c.key ? 'chip-active' : ''}`}
              >
                <i className={c.icon} /> {c.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-background-300/40 pt-4">
            <span className="mr-1 text-xs text-foreground-500">Difficulty</span>
            {difficulties.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className={`chip ${difficulty === d ? 'chip-active' : ''}`}>
                {d}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((e, i) => (
                  <Reveal key={e.id} delay={(i % 3) * 80}>
                    <EffectCard effect={e} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-background-300/40 bg-background-50 px-6 py-24 text-center shadow-sm">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-background-200 text-3xl text-foreground-500"><i className="ri-search-eye-line" /></span>
                <h3 className="font-display text-xl font-semibold text-foreground-950">No effects match "{query}"</h3>
                <p className="max-w-sm text-sm text-foreground-500">Try a different keyword or clear your filters. New effects are added regularly.</p>
                <button onClick={() => { setParams({}, { replace: true }); setDifficulty('all'); }} className="btn btn-primary mt-2">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}