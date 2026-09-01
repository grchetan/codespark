import { useState, useEffect } from 'react';
import type { OfficialEffect } from '@/mocks/admin';
import LivePreview from '@/components/feature/LivePreview';
import { supabase } from '@/lib/supabase';

const statusStyle: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  archived: 'bg-background-200 text-foreground-600 border-background-300',
};

export default function OfficialEffects() {
  const [list, setList] = useState<OfficialEffect[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hover');
  const [htmlCode, setHtmlCode] = useState('<button class="custom-btn"><span>Click Me</span></button>');
  const [cssCode, setCssCode] = useState('.custom-btn { padding: 14px 28px; background: #FF4D2E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform .3s ease; }\n.custom-btn:hover { transform: scale(1.05); }');
  const [jsCode, setJsCode] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEffects = async () => {
    setLoading(true);
    try {
      // 1. Fetch live from Supabase Cloud Database
      const { data, error } = await supabase
        .from('effects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: OfficialEffect[] = data.map((e: any) => ({
          id: e.id,
          name: e.name,
          slug: e.slug || e.id,
          category: e.category_label || e.category,
          status: e.status || 'published',
          updatedAt: (e.created_at || '2026-08-01').slice(0, 10),
          code: e.css_code || '',
          html_code: e.html_code || '',
          css_code: e.css_code || '',
          js_code: e.js_code || '',
          difficulty: e.difficulty || 'medium',
        }));
        setList(mapped);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Fallback to local backend API
    try {
      const res = await fetch('/api/admin/effects');
      const data = await res.json();
      if (data.success && Array.isArray(data.effects)) {
        setList(data.effects);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEffects();
  }, []);

  const toggleExpand = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const addEffect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `e_${Date.now()}`;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const newEff: OfficialEffect = {
      id: newId,
      name: name.trim(),
      slug,
      category,
      status: 'published',
      updatedAt: now.slice(0, 10),
      code: cssCode.trim(),
      html_code: htmlCode,
      css_code: cssCode,
      js_code: jsCode,
      difficulty,
    };

    setList((prev) => [newEff, ...prev]);

    // Save to Supabase Cloud Database
    try {
      await supabase.from('effects').insert({
        id: newId,
        slug,
        name: name.trim(),
        description: `Official ${name.trim()} component`,
        category: category.toLowerCase(),
        category_label: category,
        tags: [category.toLowerCase(), 'official', 'ui-motion'],
        difficulty,
        license: 'MIT',
        likes: 0,
        saves: 0,
        views: 0,
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        is_official: true,
        created_at: now,
      });
    } catch {}

    // Save to Backend API
    try {
      await fetch('/api/admin/effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          html_code: htmlCode,
          css_code: cssCode,
          js_code: jsCode,
          difficulty,
        }),
      });
    } catch {}

    setName('');
    setCategory('Hover');
    setShowForm(false);
  };

  const deleteEffect = async (id: string) => {
    setList((prev) => prev.filter((e) => e.id !== id));
    try {
      await supabase.from('effects').delete().eq('id', id);
    } catch {}
    try {
      await fetch(`/api/admin/effects/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const filtered = list.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            Official Component Library
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Synchronized directly with Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEffects}
            className="btn btn-secondary h-9 px-3 text-xs"
          >
            <i className="ri-refresh-line" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="btn btn-primary h-9 px-4 text-xs font-bold"
          >
            <i className={showForm ? 'ri-close-line' : 'ri-add-line'} />
            <span>{showForm ? 'Cancel' : 'Add Official Effect'}</span>
          </button>
        </div>
      </div>

      {/* Add Effect Form */}
      {showForm && (
        <form onSubmit={addEffect} className="rounded-2xl border border-background-300/80 bg-background-50 p-5 shadow-sm space-y-4 animate-fade-in">
          <h4 className="font-display text-sm font-bold text-foreground-950 border-b border-background-300/50 pb-2">
            Publish New Official Component
          </h4>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground-700 block mb-1">Component Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Magnetic Pulse Button"
                className="input text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input text-xs h-9 cursor-pointer"
              >
                <option value="Hover">Hover</option>
                <option value="Text">Text</option>
                <option value="Cursor">Cursor</option>
                <option value="3D / Tilt">3D / Tilt</option>
                <option value="Loaders">Loaders</option>
                <option value="Cards">Cards</option>
                <option value="Transitions">Transitions</option>
                <option value="Creative">Creative</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-700 block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input text-xs h-9 cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-foreground-700 block mb-1">HTML Code</label>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                rows={4}
                className="input font-mono text-xs p-2.5 w-full resize-y"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground-700 block mb-1">CSS Code</label>
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                rows={4}
                className="input font-mono text-xs p-2.5 w-full resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary h-9 px-4 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary h-9 px-5 text-xs font-bold">
              Publish to Database
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search official effects..."
          className="input pl-9 h-10 text-xs w-full"
        />
      </div>

      {/* Effects Table / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-foreground-400 gap-2 font-medium">
            <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
            <span>Loading database components...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-background-300/60 bg-background-50 p-12 text-center text-xs text-foreground-400">
            <i className="ri-code-box-line text-3xl mb-2 block opacity-40" />
            No official effects found in database.
          </div>
        ) : (
          filtered.map((item) => {
            const isExp = expanded === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-background-300/60 bg-background-50 overflow-hidden shadow-sm transition-all"
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-100/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-500/10 text-primary-600 text-sm shrink-0">
                      <i className="ri-code-s-slash-line" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-foreground-950 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-foreground-500">
                        {item.category} • updated {item.updatedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusStyle[item.status] || statusStyle.published}`}>
                      {item.status}
                    </span>
                    <i className={`ri-arrow-down-s-line text-foreground-400 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-background-300/40 p-4 bg-background-100/20 space-y-4">
                    {/* Live Preview Box */}
                    <div className="h-44 rounded-xl border border-background-300/60 overflow-hidden bg-background-50">
                      <LivePreview
                        id={item.id}
                        html={item.html_code || ''}
                        css={item.css_code || item.code}
                        js={item.js_code || ''}
                        className="h-full w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => deleteEffect(item.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                      >
                        <i className="ri-delete-bin-line mr-1" /> Delete Component
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}