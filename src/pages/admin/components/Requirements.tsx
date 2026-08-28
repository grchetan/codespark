import { useState, useEffect } from 'react';
import { requirements as defaultRequirements, type Requirement } from '@/mocks/admin';

const typeStyle: Record<Requirement['type'], string> = {
  feature: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
  content: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  bug: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  design: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const priorityStyle: Record<Requirement['priority'], string> = {
  high: 'bg-rose-500 text-white',
  medium: 'bg-amber-500 text-white',
  low: 'bg-background-300 text-foreground-700',
};

const statusStyle: Record<Requirement['status'], string> = {
  open: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  done: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

export default function Requirements() {
  const [list, setList] = useState<Requirement[]>(defaultRequirements);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Requirement['type']>('feature');
  const [priority, setPriority] = useState<Requirement['priority']>('medium');
  const [statusFilter, setStatusFilter] = useState<'all' | Requirement['status']>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/requirements')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.requirements) && data.requirements.length > 0) {
          setList(data.requirements);
        }
      })
      .catch(() => {});
  }, []);

  const setStatus = async (id: string, status: Requirement['status']) => {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await fetch(`/api/admin/requirements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const addVote = async (id: string) => {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)));
    try {
      await fetch(`/api/admin/requirements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: true }),
      });
    } catch {}
  };

  const addReq = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const newReq: Requirement = {
      id: `r_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status: 'open',
      votes: 1,
      requestedBy: 'Chetan Prajapat',
      requestedAt: new Date().toISOString().slice(0, 10),
    };

    setList((prev) => [newReq, ...prev]);

    try {
      await fetch('/api/admin/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          priority,
          requestedBy: 'Chetan Prajapat',
        }),
      });
    } catch {}

    setTitle('');
    setDescription('');
    setShowForm(false);
    setLoading(false);
  };

  const visible = list.filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter));

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            Roadmap & Feature Requirements
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Track user requests, performance goals, and platform upgrades.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary h-10 px-4 text-xs font-semibold uppercase tracking-wider self-start sm:self-auto"
        >
          <i className={showForm ? 'ri-close-line' : 'ri-add-line'} />
          {showForm ? 'Cancel' : 'Add Requirement'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={addReq} className="space-y-4 rounded-3xl border border-primary-500/30 bg-background-50 p-5 sm:p-6 shadow-md">
          <h4 className="font-display text-base font-bold text-foreground-950 flex items-center gap-2">
            <i className="ri-list-check-3 text-primary-500" /> New Platform Requirement
          </h4>
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Export CSS animations to Tailwind config"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the requirement or bug fix..."
              maxLength={500}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Type</label>
              <select className="input cursor-pointer" value={type} onChange={(e) => setType(e.target.value as Requirement['type'])}>
                <option value="feature">Feature</option>
                <option value="content">Content</option>
                <option value="bug">Bug</option>
                <option value="design">Design</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input cursor-pointer" value={priority} onChange={(e) => setPriority(e.target.value as Requirement['priority'])}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost h-10 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider">
              {loading ? 'Adding...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1 self-start sm:self-auto">
        {(['all', 'open', 'in-progress', 'done'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-foreground-950 text-background-50 shadow-sm'
                : 'text-foreground-500 hover:text-foreground-950'
            }`}
          >
            {st.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        {visible.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-background-300/60 bg-background-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between hover:border-primary-400/40 transition-all"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-foreground-950">{r.title}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${typeStyle[r.type]}`}>
                  {r.type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyle[r.priority]}`}>
                  {r.priority}
                </span>
              </div>
              {r.description && (
                <p className="mt-1 text-xs text-foreground-600 leading-relaxed">{r.description}</p>
              )}
              <div className="mt-2.5 flex items-center gap-3 text-[11px] text-foreground-400">
                <button
                  type="button"
                  onClick={() => addVote(r.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-background-200 px-2.5 py-1 font-semibold text-foreground-800 hover:bg-primary-500 hover:text-white transition-colors"
                >
                  <i className="ri-thumb-up-line" /> {r.votes} votes
                </button>
                <span>requested by {r.requestedBy} · {r.requestedAt}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusStyle[r.status]}`}>
                {r.status.replace('-', ' ')}
              </span>
              {r.status !== 'done' && (
                <button
                  type="button"
                  onClick={() => setStatus(r.id, 'done')}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <i className="ri-check-double-line" /> Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}