import { useState, useEffect } from 'react';
import { officialEffects as defaultOfficial, type OfficialEffect } from '@/mocks/admin';
import LivePreview from '@/components/feature/LivePreview';

const statusStyle: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  archived: 'bg-background-200 text-foreground-600 border-background-300',
};

export default function OfficialEffects() {
  const [list, setList] = useState<OfficialEffect[]>(defaultOfficial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hover');
  const [htmlCode, setHtmlCode] = useState('<button class="custom-btn"><span>Click Me</span></button>');
  const [cssCode, setCssCode] = useState('.custom-btn { padding: 14px 28px; background: #FF4D2E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform .3s ease; }\n.custom-btn:hover { transform: scale(1.05); }');
  const [jsCode, setJsCode] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/effects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.effects) && data.effects.length > 0) {
          setList(data.effects);
        }
      })
      .catch(() => {});
  }, []);

  const toggleExpand = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const addEffect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newEff: OfficialEffect = {
      id: `e_${Date.now()}`,
      name: name.trim(),
      slug,
      category,
      status: 'published',
      updatedAt: new Date().toISOString().slice(0, 10),
      code: cssCode.trim(),
      html_code: htmlCode,
      css_code: cssCode,
      js_code: jsCode,
      difficulty,
    };

    setList((prev) => [newEff, ...prev]);

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
    setLoading(false);
  };

  const deleteEffect = async (id: string) => {
    setList((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/effects/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const visible = list.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">Official Library Effects</h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Curated and core effects published directly into the CodeSpark catalog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary h-10 px-4 text-xs font-semibold uppercase tracking-wider self-start sm:self-auto"
        >
          <i className={showForm ? 'ri-close-line' : 'ri-add-line'} />
          {showForm ? 'Cancel' : 'Add Official Effect'}
        </button>
      </div>

      {/* Add Effect Form */}
      {showForm && (
        <form onSubmit={addEffect} className="space-y-4 rounded-3xl border border-primary-500/30 bg-background-50 p-5 sm:p-6 shadow-md">
          <h4 className="font-display text-base font-bold text-foreground-950 flex items-center gap-2">
            <i className="ri-magic-line text-primary-500" /> New Official Effect Definition
          </h4>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Effect Name *</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neon Cyber Glow"
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Hover', 'Text', 'Cursor', '3D / Tilt', 'Loaders', 'Cards', 'Transitions', 'Creative'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input cursor-pointer" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">HTML Code *</label>
              <textarea
                className="input min-h-[110px] font-mono text-xs bg-foreground-950 text-background-200"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                required
                spellCheck={false}
              />
            </div>
            <div>
              <label className="label">CSS Code *</label>
              <textarea
                className="input min-h-[110px] font-mono text-xs bg-foreground-950 text-background-200"
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                required
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost h-10 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider">
              {loading ? 'Publishing...' : 'Publish Effect'}
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
        <input
          type="text"
          className="input pl-9 text-xs sm:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search official effects..."
        />
      </div>

      {/* List of Effects */}
      <div className="space-y-3">
        {visible.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-sm">
            <button
              type="button"
              onClick={() => toggleExpand(e.id)}
              className="flex w-full items-center gap-3 p-4 sm:px-5 sm:py-4 text-left transition-colors hover:bg-background-100/50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-500/10 text-base text-primary-600">
                <i className="ri-code-s-slash-line" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-bold text-foreground-950">{e.name}</p>
                <p className="text-[11px] text-foreground-500">{e.category} · updated {e.updatedAt}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border ${statusStyle[e.status] || 'bg-background-200 text-foreground-600'}`}>
                {e.status}
              </span>
              <i className={`text-base text-foreground-400 transition-transform ${expanded === e.id ? 'rotate-180 text-foreground-950' : ''} ri-arrow-down-s-line`} />
            </button>

            {expanded === e.id && (
              <div className="border-t border-background-300/40 p-4 sm:p-5 bg-background-100/30 space-y-4">
                {/* Live Preview Box */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground-500 mb-1.5 block">
                    Live Canvas Preview
                  </label>
                  <div className="h-44 w-full rounded-xl overflow-hidden border border-background-300">
                    <LivePreview
                      id={e.id}
                      html={e.html_code}
                      css={e.css_code || e.code}
                      js={e.js_code}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                {/* Code Snippet & Remove */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-foreground-500">CSS Snippet</span>
                  <button
                    type="button"
                    onClick={() => deleteEffect(e.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-500 px-3 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
                  >
                    <i className="ri-delete-bin-line" /> Delete Effect
                  </button>
                </div>
                <pre className="code-scroll max-h-36 overflow-auto rounded-xl bg-foreground-950 p-4 text-xs font-mono text-background-200 leading-relaxed">
                  {e.css_code || e.code}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}