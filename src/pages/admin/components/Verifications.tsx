import { useState, useEffect } from 'react';
import { submissions as defaultSubmissions, type Submission } from '@/mocks/admin';
import LivePreview from '@/components/feature/LivePreview';
import CodeBlock from '@/components/feature/CodeBlock';

type Status = 'pending' | 'approved' | 'rejected';

const statusStyle: Record<Status, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
};

export default function Verifications() {
  const [list, setList] = useState<Submission[]>(defaultSubmissions);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const [inspectModal, setInspectModal] = useState<Submission | null>(null);
  const [inspectTab, setInspectTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/submissions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
          setList(data.submissions);
        }
      })
      .catch(() => {});
  }, []);

  const setStatus = async (id: string, status: Status) => {
    setActionLoading(true);
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (inspectModal?.id === id) {
      setInspectModal({ ...inspectModal, status });
    }

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
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            Effect Submissions & Verifications
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Test and approve or reject interactive effects submitted by the developer community.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
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
          <span>Effect Details</span>
          <span>Author</span>
          <span>Submitted</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
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
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-md bg-background-200/80 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div className="text-xs font-semibold text-foreground-800 truncate">
                {s.author}
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
                    setInspectTab('preview');
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-background-300 bg-background-50 px-2.5 text-xs font-semibold text-foreground-700 hover:bg-background-200 hover:text-foreground-950 transition-colors"
                >
                  <i className="ri-eye-line text-primary-500" /> Test Live
                </button>

                {s.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setStatus(s.id, 'approved')}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-500 px-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <i className="ri-check-line" /> Approve
                  </button>
                )}

                {s.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setStatus(s.id, 'rejected')}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary-500 px-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    <i className="ri-close-line" /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-background-200 text-2xl text-foreground-400">
                <i className="ri-checkbox-blank-circle-line" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground-950">No submissions found</p>
              <p className="text-xs text-foreground-500 mt-1">Try switching status filters or clear search keyword.</p>
            </div>
          )}
        </div>
      </div>

      {/* SUBMISSION INSPECTOR & LIVE TEST MODAL */}
      {inspectModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-background-50 shadow-2xl border border-background-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-background-300/60 px-5 py-4 bg-background-100/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  <h4 className="font-display text-lg font-bold text-foreground-950">{inspectModal.name}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${statusStyle[inspectModal.status as Status]}`}>
                    {inspectModal.status}
                  </span>
                </div>
                <p className="text-xs text-foreground-500 mt-0.5">
                  By {inspectModal.author} · Category: {inspectModal.category} · {inspectModal.difficulty}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-foreground-500 hover:bg-background-200 hover:text-foreground-950"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex items-center gap-1 border-b border-background-300/40 px-5 py-2 bg-background-50">
              <button
                type="button"
                onClick={() => setInspectTab('preview')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  inspectTab === 'preview' ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:bg-background-200'
                }`}
              >
                <i className="ri-play-circle-line" /> Live Interactive Test
              </button>
              <button
                type="button"
                onClick={() => setInspectTab('html')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  inspectTab === 'html' ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:bg-background-200'
                }`}
              >
                <i className="ri-html5-line text-orange-500" /> HTML
              </button>
              <button
                type="button"
                onClick={() => setInspectTab('css')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  inspectTab === 'css' ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:bg-background-200'
                }`}
              >
                <i className="ri-css3-line text-blue-500" /> CSS
              </button>
              {inspectModal.js_code && (
                <button
                  type="button"
                  onClick={() => setInspectTab('js')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    inspectTab === 'js' ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:bg-background-200'
                  }`}
                >
                  <i className="ri-javascript-line text-amber-500" /> JS
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {inspectTab === 'preview' ? (
                <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-background-300 shadow-inner">
                  <LivePreview
                    html={inspectModal.html_code}
                    css={inspectModal.css_code}
                    js={inspectModal.js_code}
                    className="h-full w-full"
                  />
                </div>
              ) : inspectTab === 'html' ? (
                <CodeBlock code={inspectModal.html_code || '<!-- No HTML -->'} lang="html" />
              ) : inspectTab === 'css' ? (
                <CodeBlock code={inspectModal.css_code || '/* No CSS */'} lang="css" />
              ) : (
                <CodeBlock code={inspectModal.js_code || '// No JS'} lang="js" />
              )}

              {inspectModal.description && (
                <div className="rounded-xl bg-background-100/70 p-3 text-xs text-foreground-600 leading-relaxed">
                  <span className="font-bold text-foreground-950">Author Description: </span>
                  {inspectModal.description}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-background-300/60 px-5 py-3 bg-background-100/50">
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="btn btn-ghost h-9 text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setStatus(inspectModal.id, 'rejected')}
                  className="btn h-9 px-4 text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600"
                >
                  <i className="ri-close-line" /> Reject Submission
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setStatus(inspectModal.id, 'approved')}
                  className="btn h-9 px-4 text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <i className="ri-check-line" /> Approve & Publish Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}