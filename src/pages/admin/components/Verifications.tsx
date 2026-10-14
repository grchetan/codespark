import { useState, useEffect } from 'react';
import type { Submission } from '@/mocks/admin';
import LivePreview from '@/components/feature/LivePreview';
import CodeBlock from '@/components/feature/CodeBlock';
import { supabase } from '@/lib/supabase';

type Status = 'pending' | 'approved' | 'rejected';

const statusStyle: Record<Status, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
};

export default function Verifications() {
  const [list, setList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'html' | 'react'>('all');
  const [search, setSearch] = useState('');
  const [inspectModal, setInspectModal] = useState<Submission | null>(null);
  const [inspectTab, setInspectTab] = useState<'preview' | 'html' | 'css' | 'js' | 'react' | 'snippet'>('preview');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Submission[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          author: s.author_name || s.author || 'Community Member',
          author_handle: s.author_handle || `@${(s.author_name || 'maker').toLowerCase().replace(/\s+/g, '')}`,
          email: s.author_email || '',
          submittedAt: (s.created_at || '2026-08-01').slice(0, 10),
          status: s.status || 'pending',
          difficulty: s.difficulty || 'medium',
          tags: s.tags || [],
          description: s.description || '',
          type: s.type || 'html',
          react_code: s.react_code || '',
          dependencies: s.dependencies || '',
          demo_url: s.demo_url || '',
          html_code: s.html_code || '',
          css_code: s.css_code || '',
          js_code: s.js_code || '',
        }));
        setList(mapped);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Fallback to API
    try {
      const res = await fetch('/api/admin/submissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setList(data.submissions);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const setStatus = async (id: string, status: Status) => {
    setActionLoading(true);
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (inspectModal?.id === id) {
      setInspectModal({ ...inspectModal, status });
    }

    try {
      await supabase.from('submissions').update({ status }).eq('id', id);

      // Only auto-publish HTML/CSS/JS effects into effects table.
      // React components are integrated manually into src/effects/registry.tsx!
      if (status === 'approved') {
        const sub = list.find((s) => s.id === id);
        if (sub && sub.type !== 'react') {
          const slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          await supabase.from('effects').upsert({
            id: sub.id.startsWith('eff_') ? sub.id : `eff_${sub.id}`,
            slug: slug || `effect-${Date.now()}`,
            name: sub.name,
            category: sub.category.toLowerCase(),
            category_label: sub.category,
            difficulty: sub.difficulty || 'medium',
            description: sub.description || `${sub.name} interactive UI effect created by ${sub.author}.`,
            author_id: sub.id,
            author_name: sub.author,
            author_handle: sub.author_handle || `@${sub.author.toLowerCase().replace(/\s+/g, '')}`,
            html_code: sub.html_code || '',
            css_code: sub.css_code || '',
            js_code: sub.js_code || '',
            tags: sub.tags && sub.tags.length > 0 ? sub.tags : [sub.category.toLowerCase(), 'interactive'],
            status: 'published',
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch {}

    try {
      await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const filtered = list.filter((s) => {
    const matchesFilter = filter === 'all' ? true : s.status === filter;
    const matchesType = typeFilter === 'all' ? true : (s.type || 'html') === typeFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  const getRegistrySnippet = (sub: Submission) => {
    const cleanSlug = sub.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanFnName = sub.name.trim().replace(/[^a-zA-Z0-9]/g, '');

    return `// ==============================================================================
// COMMUNITY REACT EFFECT: ${sub.name}
// Creator Credit: ${sub.author} (${sub.author_handle || '@maker'})
// Dependencies: ${sub.dependencies || 'none'}
// ==============================================================================

// 1. Paste Component into src/effects/registry.tsx:
${sub.react_code || '// No React code provided'}

// 2. Add entry to MANUAL_REACT_EFFECTS array in src/effects/registry.tsx:
  {
    id: 'react-${cleanSlug}',
    slug: '${cleanSlug}',
    name: '${sub.name.replace(/'/g, "\\'")}',
    category: '${sub.category.toLowerCase()}',
    categoryLabel: '${sub.category}',
    description: '${(sub.description || `${sub.name} interactive component`).replace(/'/g, "\\'")}',
    tags: ${JSON.stringify(sub.tags && sub.tags.length > 0 ? sub.tags : [sub.category.toLowerCase(), 'react', 'interactive'])},
    difficulty: '${sub.difficulty || 'medium'}',
    isOfficial: false,
    author: {
      name: '${sub.author.replace(/'/g, "\\'")}',
      handle: '${(sub.author_handle || `@${sub.author.toLowerCase().replace(/\\s+/g, '')}`).replace(/'/g, "\\'")}',
      role: 'Community Creator',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(sub.author)}',
      verified: true,
    },
  },

// 3. Add to EFFECT_REGISTRY mapping:
// ${cleanFnName}: React${cleanFnName},`;
  };

  const copySnippet = (sub: Submission) => {
    const text = getRegistrySnippet(sub);
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            Effect Submissions & Verifications
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Test HTML/CSS/JS effects directly, or review & integrate React TSX component requests with creator attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Component Type Filter */}
          <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                typeFilter === 'all' ? 'bg-foreground-950 text-background-50 shadow-sm' : 'text-foreground-500 hover:text-foreground-950'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('html')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                typeFilter === 'html' ? 'bg-foreground-950 text-background-50 shadow-sm' : 'text-foreground-500 hover:text-foreground-950'
              }`}
            >
              HTML/CSS
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('react')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                typeFilter === 'react' ? 'bg-primary-500 text-white shadow-sm' : 'text-foreground-500 hover:text-foreground-950'
              }`}
            >
              <i className="ri-reactjs-line" />
              <span>React Proposals</span>
              {list.filter((s) => s.type === 'react' && s.status === 'pending').length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold">
                  {list.filter((s) => s.type === 'react' && s.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-foreground-950 text-background-50 shadow-sm'
                    : 'text-foreground-500 hover:text-foreground-950'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
        <input
          type="text"
          className="input pl-9 text-xs sm:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by effect, author, or category..."
        />
      </div>

      {/* Submissions Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-sm">
        {/* Table Header for Desktop */}
        <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr] gap-4 border-b border-background-300/50 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground-400 sm:grid bg-background-100/50">
          <span>Component / Proposal</span>
          <span>Submitter Credit</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-foreground-400 gap-2 font-medium">
            <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
            <span>Loading submissions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-foreground-400">
            <i className="ri-shield-check-line text-3xl mb-2 block opacity-40 text-emerald-500" />
            No submissions matching filter.
          </div>
        ) : (
          <div className="divide-y divide-background-200/70">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-1 gap-3 p-4 sm:px-5 sm:py-4 sm:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr] sm:items-center hover:bg-background-100/40 transition-colors"
              >
                {/* Effect Name & Tags */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate">{s.name}</p>
                    <span className="rounded bg-background-200 px-1.5 py-0.5 text-[10px] font-semibold text-foreground-600 uppercase">
                      {s.difficulty}
                    </span>
                    {s.type === 'react' ? (
                      <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 px-2 py-0.5 text-[9px] font-extrabold uppercase flex items-center gap-1">
                        <i className="ri-reactjs-line text-xs" /> React TSX
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 px-2 py-0.5 text-[9px] font-semibold uppercase">
                        HTML/CSS
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-background-200/80 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                        #{t}
                      </span>
                    ))}
                    {s.dependencies && (
                      <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-600">
                        deps: {s.dependencies}
                      </span>
                    )}
                  </div>
                </div>

                {/* Author Credit */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground-900 truncate">{s.author}</p>
                  <p className="text-[11px] font-mono text-foreground-400 truncate">{s.author_handle || '@maker'}</p>
                </div>

                {/* Submitted Date */}
                <div className="text-xs text-foreground-500">
                  {s.submittedAt}
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize border ${
                      statusStyle[s.status as Status] || 'bg-background-200 text-foreground-600'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {s.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5">
                  {/* Inspect Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setInspectModal(s);
                      setInspectTab(s.type === 'react' ? 'react' : 'preview');
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-background-300 bg-background-50 px-2.5 text-xs font-semibold text-foreground-700 hover:bg-background-200 hover:text-foreground-950 transition-colors"
                  >
                    <i className={s.type === 'react' ? 'ri-code-s-slash-line text-cyan-500' : 'ri-eye-line text-primary-500'} />
                    {s.type === 'react' ? 'Inspect TSX' : 'Test Live'}
                  </button>

                  {s.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setStatus(s.id, 'approved')}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                    >
                      <i className="ri-check-line" /> {s.type === 'react' ? 'Approve' : 'Approve'}
                    </button>
                  )}

                  {s.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setStatus(s.id, 'rejected')}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary-500/10 border border-primary-500/30 px-2.5 text-xs font-semibold text-primary-600 hover:bg-primary-500/20 transition-colors"
                    >
                      <i className="ri-close-line" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Inspection / Testing Modal */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col h-[90vh] w-full max-w-4xl rounded-3xl bg-background-50 shadow-2xl border border-background-300/80 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-background-300/60 px-6 py-4 bg-background-100/50">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                  <span>{inspectModal.name}</span>
                  {inspectModal.type === 'react' && (
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 px-2 py-0.5 text-[10px] font-black uppercase">
                      React Component Request
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusStyle[inspectModal.status as Status]}`}>
                    {inspectModal.status}
                  </span>
                </h3>
                <p className="text-xs text-foreground-500">
                  By {inspectModal.author} ({inspectModal.author_handle || '@maker'}) • {inspectModal.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-foreground-500 hover:bg-background-200 hover:text-foreground-950 transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center justify-between border-b border-background-300/40 px-6 py-2 bg-background-50">
              <div className="flex items-center gap-1">
                {inspectModal.type === 'react' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setInspectTab('react')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        inspectTab === 'react' ? 'bg-foreground-950 text-background-50 shadow-sm' : 'text-foreground-500 hover:text-foreground-950'
                      }`}
                    >
                      TSX Component Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectTab('snippet')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        inspectTab === 'snippet' ? 'bg-foreground-950 text-background-50 shadow-sm' : 'text-foreground-500 hover:text-foreground-950'
                      }`}
                    >
                      Registry Drop-In Snippet
                    </button>
                  </>
                ) : (
                  (['preview', 'html', 'css', 'js'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setInspectTab(tab)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        inspectTab === tab
                          ? 'bg-foreground-950 text-background-50 shadow-sm'
                          : 'text-foreground-500 hover:text-foreground-950'
                      }`}
                    >
                      {tab === 'preview' ? 'Live Stage' : tab}
                    </button>
                  ))
                )}
              </div>

              {inspectModal.type === 'react' && (
                <button
                  type="button"
                  onClick={() => copySnippet(inspectModal)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30 px-3 py-1 text-xs font-bold text-primary-600 hover:bg-primary-500/20 transition-all"
                >
                  <i className={copiedSnippet ? 'ri-check-line text-emerald-600' : 'ri-file-copy-line'} />
                  <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Registry Snippet'}</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-background-100/20">
              {inspectModal.type === 'react' ? (
                inspectTab === 'snippet' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-xs text-foreground-800">
                      <p className="font-bold text-foreground-950 mb-1">How to Integrate this React Effect:</p>
                      <p className="leading-relaxed">
                        1. Copy the snippet below.<br />
                        2. Paste the component and its entry into <code className="bg-background-50 px-1 py-0.5 rounded font-mono">src/effects/registry.tsx</code>.<br />
                        3. The creator credit (<span className="font-bold text-primary-600">{inspectModal.author}</span> {inspectModal.author_handle}) is already encoded into the snippet!<br />
                        4. Click &quot;Approve &amp; Mark as Integrated&quot; below.
                      </p>
                    </div>
                    <CodeBlock code={getRegistrySnippet(inspectModal)} lang="typescript" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspectModal.dependencies && (
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-900 flex items-center gap-2">
                        <i className="ri-archive-line text-blue-600 text-base" />
                        <span><strong>NPM Dependencies Required:</strong> {inspectModal.dependencies}</span>
                      </div>
                    )}
                    {inspectModal.demo_url && (
                      <div className="rounded-xl border border-background-300 bg-background-50 p-3 text-xs flex items-center justify-between">
                        <span className="text-foreground-600">External Demo / Sandbox Link:</span>
                        <a href={inspectModal.demo_url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary-500 underline flex items-center gap-1">
                          Open Demo ↗
                        </a>
                      </div>
                    )}
                    <CodeBlock code={inspectModal.react_code || '// No TSX provided'} lang="tsx" />
                  </div>
                )
              ) : inspectTab === 'preview' ? (
                <div className="h-full min-h-[350px] rounded-2xl border border-background-300/60 overflow-hidden bg-background-50">
                  <LivePreview
                    id={inspectModal.id}
                    html={inspectModal.html_code || ''}
                    css={inspectModal.css_code || ''}
                    js={inspectModal.js_code || ''}
                    className="h-full w-full"
                  />
                </div>
              ) : inspectTab === 'html' ? (
                <CodeBlock code={inspectModal.html_code || '<!-- No HTML provided -->'} lang="html" />
              ) : inspectTab === 'css' ? (
                <CodeBlock code={inspectModal.css_code || '/* No CSS provided */'} lang="css" />
              ) : (
                <CodeBlock code={inspectModal.js_code || '// No JavaScript provided'} lang="js" />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-background-300/60 px-6 py-4 bg-background-50">
              <span className="text-xs text-foreground-500">
                Submitted on {inspectModal.submittedAt} by {inspectModal.author} ({inspectModal.author_handle || '@maker'})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setStatus(inspectModal.id, 'rejected')}
                  className="btn btn-secondary h-9 px-4 text-xs font-semibold text-primary-600 hover:bg-primary-500/10"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setStatus(inspectModal.id, 'approved')}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5 text-xs font-bold"
                >
                  {inspectModal.type === 'react' ? 'Mark as Integrated' : 'Approve & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}