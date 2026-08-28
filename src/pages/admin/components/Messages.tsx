import { useState, useEffect } from 'react';
import type { ContactMessage } from '@/mocks/admin';

export default function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetch('/api/admin/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: 'read' | 'unread' | 'resolved') => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    if (selectedMsg?.id === id) {
      setSelectedMsg({ ...selectedMsg, status });
    }
    try {
      await fetch(`/api/admin/messages/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
    try {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const visible = messages.filter((m) => (filter === 'all' ? true : m.status === filter));

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            Platform Inquiries & Messages
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            Contact form submissions and feedback from visitors and creators.
          </p>
        </div>

        <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1 self-start sm:self-auto">
          {(['all', 'unread', 'resolved'] as const).map((f) => (
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

      {/* Messages List / Grid */}
      <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-sm">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-background-200 text-2xl text-foreground-400">
              <i className="ri-inbox-line" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground-950">No {filter} messages found</p>
            <p className="text-xs text-foreground-500 mt-1">Inquiries sent via the /contact page will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-background-200/70">
            {visible.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMsg(m);
                  if (m.status === 'unread') updateStatus(m.id, 'read');
                }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 cursor-pointer transition-colors ${
                  m.status === 'unread' ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'hover:bg-background-100/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {m.status === 'unread' && (
                      <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-foreground-950 truncate">{m.name}</span>
                    <span className="rounded-md bg-background-200 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                      {m.topic}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-600 line-clamp-1 mt-1">{m.message}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] text-foreground-400">{m.submitted_at}</span>
                  <div className="flex items-center gap-1.5">
                    {m.status !== 'resolved' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(m.id, 'resolved');
                        }}
                        className="chip text-[11px] hover:border-emerald-500 hover:text-emerald-600"
                        title="Mark as resolved"
                      >
                        <i className="ri-check-line" /> Resolve
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                        Resolved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(m.id);
                      }}
                      className="grid h-7 w-7 place-items-center rounded-lg text-foreground-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete message"
                    >
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Reader Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300 space-y-4">
            <div className="flex items-center justify-between border-b border-background-200 pb-3">
              <div>
                <h4 className="font-display text-lg font-bold text-foreground-950">{selectedMsg.name}</h4>
                <p className="text-xs text-foreground-500">{selectedMsg.email} · {selectedMsg.topic}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMsg(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-foreground-400 hover:bg-background-200"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="rounded-2xl bg-background-100/70 p-4 text-xs sm:text-sm text-foreground-800 leading-relaxed max-h-60 overflow-y-auto">
              {selectedMsg.message}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.topic}`}
                className="btn btn-primary h-9 px-4 text-xs font-semibold"
              >
                <i className="ri-reply-line" /> Reply via Email
              </a>
              <div className="flex items-center gap-2">
                {selectedMsg.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedMsg.id, 'resolved')}
                    className="btn btn-secondary h-9 px-3.5 text-xs font-semibold"
                  >
                    <i className="ri-check-line text-emerald-600" /> Mark Resolved
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteMessage(selectedMsg.id)}
                  className="btn btn-ghost h-9 text-xs text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
