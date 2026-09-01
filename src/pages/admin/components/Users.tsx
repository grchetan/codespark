import { useState, useEffect } from 'react';
import { adminUsers as defaultUsers, type AdminUser } from '@/mocks/admin';

const roleStyle: Record<AdminUser['role'], string> = {
  admin: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
  moderator: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  member: 'bg-background-200 text-foreground-700 border-background-300',
};

const statusStyle: Record<AdminUser['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  banned: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function Users({ bannedOnly = false }: { bannedOnly?: boolean }) {
  const [list, setList] = useState<AdminUser[]>(defaultUsers);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUser['role']>('all');
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminUser['role']>('member');
  const [newUserPass, setNewUserPass] = useState('User@123');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setList(data.users);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const visible = list.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return bannedOnly ? matchesQuery && u.status === 'banned' : matchesQuery && matchesRole;
  });

  const toggleBan = async (id: string) => {
    const target = list.find((u) => u.id === id);
    const newStatus = target?.status === 'banned' ? 'active' : 'banned';
    setList((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
    setBanModal(null);
    showToast(`User marked as ${newStatus}`);

    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const changeRole = async (id: string, role: AdminUser['role']) => {
    setList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    showToast(`Role updated to ${role}`);
    try {
      await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
          password: newUserPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => [
          {
            id: data.userId || `u_${Date.now()}`,
            name: newUserName.trim(),
            email: newUserEmail.trim(),
            role: newUserRole,
            status: 'active',
            joined: new Date().toISOString().slice(0, 10),
            effects: 0,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newUserName.trim() || 'User')}`,
          },
          ...prev,
        ]);
        setAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        showToast('User created successfully');
      }
    } catch {}
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 border border-emerald-500/30 animate-fade-in flex items-center gap-2">
          <i className="ri-check-line text-base" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
            {bannedOnly ? 'Banned & Moderated Users' : 'Platform Users & Roles'}
          </h3>
          <p className="text-xs sm:text-sm text-foreground-500 mt-0.5">
            {bannedOnly
              ? 'Users currently restricted from submitting or interacting.'
              : 'Manage member privileges, developer accounts, and moderators.'}
          </p>
        </div>

        {!bannedOnly && (
          <button
            type="button"
            onClick={() => setAddUserModal(true)}
            className="btn btn-primary h-10 px-4 text-xs font-semibold uppercase tracking-wider self-start sm:self-auto"
          >
            <i className="ri-user-add-line" /> Add New User
          </button>
        )}
      </div>

      {/* Search & Role Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="text"
            className="input pl-9 text-xs sm:text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
          />
        </div>

        {!bannedOnly && (
          <div className="flex gap-1 rounded-xl border border-background-300/80 bg-background-50 p-1 self-start sm:self-auto">
            {(['all', 'admin', 'moderator', 'member'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-foreground-950 text-background-50 shadow-sm'
                    : 'text-foreground-500 hover:text-foreground-950'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Users List Card */}
      <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-sm">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-background-200 text-2xl text-foreground-400">
              <i className="ri-user-search-line" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground-950">No users match your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-background-200/70">
            {visible.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-background-100/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      u.avatar && !u.avatar.includes('unsplash')
                        ? u.avatar
                        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.name || 'User')}`
                    }
                    alt={u.name}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-background-300/80 bg-background-100 shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground-950 truncate flex items-center gap-1.5">
                      {u.name}
                      {u.name === 'Chetan Prajapat' && (
                        <span className="rounded bg-primary-500/10 px-1.5 py-0.5 text-[9px] font-bold text-primary-600 uppercase border border-primary-500/20">
                          Lead
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-foreground-500 truncate">{u.email} · {u.effects} effects</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {!bannedOnly && (
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as AdminUser['role'])}
                      className="cursor-pointer rounded-lg border border-background-300 bg-background-50 px-2.5 py-1 text-xs font-medium text-foreground-800"
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="member">Member</option>
                    </select>
                  )}

                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                      statusStyle[u.status] || 'bg-background-200 text-foreground-600'
                    }`}
                  >
                    {u.status}
                  </span>

                  {u.status === 'banned' ? (
                    <button
                      type="button"
                      onClick={() => toggleBan(u.id)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                    >
                      <i className="ri-user-unfollow-line" /> Unban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanModal(u)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary-500 px-3 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
                    >
                      <i className="ri-user-forbid-line" /> Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleCreateUser} className="w-full max-w-md rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300 space-y-4">
            <div className="flex items-center justify-between border-b border-background-200 pb-3">
              <h4 className="font-display text-lg font-bold text-foreground-950">Add / Invite New User</h4>
              <button type="button" onClick={() => setAddUserModal(false)} className="text-foreground-400 hover:text-foreground-950">
                <i className="ri-close-line text-lg" />
              </button>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required placeholder="e.g. Rahul Sharma" />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required placeholder="rahul@codespark.dev" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Role</label>
                <select className="input cursor-pointer" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}>
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Initial Password</label>
                <input className="input" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} placeholder="User@123" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setAddUserModal(false)} className="btn btn-ghost h-10 text-xs">Cancel</button>
              <button type="submit" className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider">Create Account</button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300 space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-500/10 text-xl text-rose-600">
                <i className="ri-user-forbid-line" />
              </span>
              <div>
                <h4 className="font-display text-lg font-bold text-foreground-950">Ban {banModal.name}?</h4>
                <p className="text-xs text-foreground-500">Restricts user publishing immediately.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBanModal(null)} className="btn btn-ghost h-10 text-xs">Cancel</button>
              <button type="button" onClick={() => toggleBan(banModal.id)} className="btn btn-primary h-10 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700">
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}