import { useState, useEffect } from 'react';
import { adminUsers as defaultUsers, type AdminUser } from '@/mocks/admin';
import { supabase } from '@/lib/supabase';
import { resolveAvatar } from '@/lib/avatar';
import { useAuth } from '@/context/AuthContext';
import {
  type UserRole,
  isSuperAdminOwner,
  getAllowedRoleOptions,
  canBanUser,
} from '@/lib/permissions';
import { hashPassword } from '@/lib/security';

const roleStyle: Record<UserRole, string> = {
  superadmin: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  admin: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
  moderator: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  member: 'bg-background-200 text-foreground-700 border-background-300',
};

const statusStyle: Record<AdminUser['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  banned: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function Users({
  bannedOnly = false,
}: {
  bannedOnly?: boolean;
}) {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const actorRole: UserRole = isSuperAdmin ? 'superadmin' : (currentUser?.role || 'member');

  const [list, setList] = useState<AdminUser[]>(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('member');
  const [newUserPass, setNewUserPass] = useState('User@123');
  const [showPass, setShowPass] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch directly from Supabase Cloud Database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: AdminUser[] = data.map((u: any) => {
          const isTargetOwner = u.email === 'chetanprajapat340@gmail.com';
          return {
            id: u.id,
            name: isTargetOwner && !u.name ? 'Chetan Prajapat' : (u.name || u.email?.split('@')[0] || 'User'),
            email: u.email,
            role: (isTargetOwner ? 'superadmin' : (u.role || 'member')) as AdminUser['role'],
            status: (u.status as AdminUser['status']) || 'active',
            avatar: resolveAvatar(u.avatar, u.name, u.email),
            joined: u.created_at ? u.created_at.slice(0, 10) : '2026-08-01',
            effects: u.effects_count || 0,
          };
        });
        setList(mapped);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Fallback to Backend API
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setList(data.users);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const visible = list.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return bannedOnly
      ? matchesQuery && u.status === 'banned'
      : matchesQuery && matchesRole;
  });

  const toggleBan = async (id: string) => {
    const target = list.find((u) => u.id === id);
    if (!target) return;

    const targetRole = (target.role || 'member') as UserRole;
    const isTargetOwner = isSuperAdminOwner(target.email, targetRole);

    if (!canBanUser(actorRole, targetRole, isTargetOwner)) {
      showToast('⚠️ Permission Denied: You cannot modify this user status.');
      return;
    }

    const newStatus: AdminUser['status'] = target.status === 'banned' ? 'active' : 'banned';

    setList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );

    // Save to Supabase Cloud Database
    try {
      await supabase.from('users').update({ status: newStatus }).eq('id', id);
    } catch {}

    // Save to Backend API
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actorRole }),
      });
    } catch {}

    setBanModal(null);
    showToast(`User status updated to "${newStatus}"`);
  };

  const changeRole = async (id: string, newRole: UserRole) => {
    const target = list.find((u) => u.id === id);
    if (!target) return;

    const targetRole = (target.role || 'member') as UserRole;
    const isTargetOwner = isSuperAdminOwner(target.email, targetRole);

    const allowedOptions = getAllowedRoleOptions(actorRole, targetRole, isTargetOwner);
    const isAllowed = allowedOptions.some((opt) => opt.value === newRole);

    if (!isAllowed) {
      showToast('⚠️ Permission Denied: You are not authorized to assign this role.');
      return;
    }

    setList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole as AdminUser['role'] } : u))
    );

    // Save to Supabase Cloud Database
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', id);
    } catch {}

    // Save to Backend API
    try {
      await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, actorRole }),
      });
    } catch {}

    showToast(`Role updated to "${newRole}"`);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    // Validate if actor is allowed to create this role
    if (newUserRole === 'admin' && !isSuperAdmin) {
      showToast('⚠️ Only the Super Admin (Owner) can create Admin accounts.');
      return;
    }

    const emailClean = newUserEmail.trim().toLowerCase();
    const now = new Date().toISOString();
    const newUserId = `u_${Date.now()}`;
    const hashedPassword = await hashPassword(newUserPass);

    const newUserObj: AdminUser = {
      id: newUserId,
      name: newUserName.trim(),
      email: emailClean,
      role: newUserRole as AdminUser['role'],
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newUserName.trim())}`,
      joined: now.slice(0, 10),
      effects: 0,
    };

    setList((prev) => [newUserObj, ...prev]);
    setAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPass('User@123');
    showToast('User created successfully in database!');

    // Save to Supabase Cloud Database (Profile record)
    try {
      await supabase.from('users').insert({
        id: newUserId,
        email: emailClean,
        name: newUserObj.name,
        role: newUserRole,
        status: 'active',
        avatar: newUserObj.avatar,
        created_at: now,
      });
    } catch {}

    // Save to Backend API
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserObj.name,
          email: newUserObj.email,
          role: newUserRole,
          password: newUserPass,
          actorRole,
        }),
      });
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

      {/* Permission Scope Banner for Admin */}
      {!isSuperAdmin && actorRole === 'admin' && (
        <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4 text-xs text-foreground-800 flex items-center gap-3 animate-fade-in">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-500 text-white shrink-0 text-base shadow-sm">
            <i className="ri-shield-user-line" />
          </span>
          <div>
            <p className="font-bold text-foreground-950">Administrator Access Scope</p>
            <p className="text-[11px] text-foreground-600 mt-0.5">
              You can moderate members and assign Moderator status. Appointing new Admins or modifying the Super Admin is strictly reserved for the Platform Owner.
            </p>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground-950">
            {bannedOnly ? 'Banned Users' : 'Users Directory'}
          </h2>
          <p className="text-xs text-foreground-500 mt-0.5">
            {bannedOnly
              ? 'Manage accounts currently blocked from accessing CodeSpark.'
              : 'Directly synchronized with Supabase cloud database.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh Database"
            className="btn btn-secondary h-9 px-3 text-xs"
          >
            <i className="ri-refresh-line" />
            Refresh
          </button>
          {!bannedOnly && (
            <button
              type="button"
              onClick={() => setAddUserModal(true)}
              className="btn btn-primary h-9 px-4 text-xs font-bold"
            >
              <i className="ri-user-add-line" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="input pl-9 h-10 text-xs w-full"
          />
        </div>

        {!bannedOnly && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'admin', 'moderator', 'member'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`chip text-xs capitalize ${
                  roleFilter === r
                    ? 'bg-foreground-950 text-background-50 font-bold'
                    : ''
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-background-300/60 bg-background-50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-foreground-400 gap-2 font-medium">
            <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
            <span>Synchronizing with database...</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-xs text-foreground-400">
            <i className="ri-user-unfollow-line text-3xl mb-2 block opacity-40" />
            No users match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-background-300/60 bg-background-100/50 text-[11px] font-bold text-foreground-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-300/40">
                {visible.map((u) => {
                  const targetRole = (u.role || 'member') as UserRole;
                  const isTargetOwner = isSuperAdminOwner(u.email, targetRole);
                  const allowedRoleOptions = getAllowedRoleOptions(actorRole, targetRole, isTargetOwner);
                  const userCanBan = canBanUser(actorRole, targetRole, isTargetOwner);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-background-100/30 transition-colors"
                    >
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveAvatar(u.avatar, u.name, u.email)}
                            alt={u.name}
                            className={`h-9 w-9 rounded-full object-cover border shrink-0 ${
                              isTargetOwner ? 'border-amber-500 shadow-sm' : 'border-background-300 bg-background-100'
                            }`}
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground-950 truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isTargetOwner && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 uppercase border border-amber-500/30 flex items-center gap-1">
                                  <i className="ri-vip-crown-fill text-amber-500" /> Super Admin
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-foreground-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isTargetOwner ? (
                          <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase bg-amber-500/15 text-amber-700 border border-amber-500/30">
                            <i className="ri-vip-crown-fill text-amber-500 text-xs" />
                            Super Admin (Owner)
                          </span>
                        ) : allowedRoleOptions.length > 0 ? (
                          <select
                            value={targetRole}
                            onChange={(e) =>
                              changeRole(u.id, e.target.value as UserRole)
                            }
                            className={`rounded-lg px-2 py-1 text-[11px] font-semibold uppercase border outline-none cursor-pointer ${
                              roleStyle[targetRole] || roleStyle.member
                            }`}
                          >
                            {/* If current role not in allowed options, show as disabled current */}
                            {!allowedRoleOptions.some((o) => o.value === targetRole) && (
                              <option value={targetRole} disabled>{targetRole}</option>
                            )}
                            {allowedRoleOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase border ${
                              roleStyle[targetRole] || roleStyle.member
                            }`}
                          >
                            {targetRole}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                            statusStyle[u.status] || statusStyle.active
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'active'
                                ? 'bg-emerald-500'
                                : u.status === 'banned'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-foreground-500 font-mono text-[11px]">
                        {u.joined}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isTargetOwner ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <i className="ri-shield-check-fill text-xs" /> Protected Owner
                          </span>
                        ) : userCanBan ? (
                          <button
                            type="button"
                            onClick={() => setBanModal(u)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                              u.status === 'banned'
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30'
                            }`}
                          >
                            {u.status === 'banned' ? 'Unban' : 'Ban'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-foreground-400 font-medium">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300/80 space-y-4">
            <div className="flex items-center justify-between border-b border-background-300/50 pb-3">
              <h3 className="font-display text-base font-bold text-foreground-950">
                Add User to Database
              </h3>
              <button
                type="button"
                onClick={() => setAddUserModal(false)}
                className="text-foreground-400 hover:text-foreground-950 text-base"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="input text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. user@domain.com"
                  className="input text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-700 block mb-1">
                  Set Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    placeholder="Enter password..."
                    className="input text-xs h-9 pr-8"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-sm"
                  >
                    <i
                      className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-700 block mb-1">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as UserRole)
                  }
                  className="input text-xs h-9 cursor-pointer"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  {isSuperAdmin && <option value="admin">Admin</option>}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddUserModal(false)}
                  className="btn btn-secondary h-9 text-xs flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary h-9 text-xs font-bold flex-1"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ban / Unban Confirmation Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300/80 space-y-4">
            <h3 className="font-display text-base font-bold text-foreground-950">
              {banModal.status === 'banned' ? 'Unban User?' : 'Ban User?'}
            </h3>
            <p className="text-xs text-foreground-600 leading-relaxed">
              Are you sure you want to{' '}
              <strong className="text-foreground-950">
                {banModal.status === 'banned' ? 'unban' : 'ban'}
              </strong>{' '}
              {banModal.name} ({banModal.email})?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBanModal(null)}
                className="btn btn-secondary h-9 text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => toggleBan(banModal.id)}
                className={`btn h-9 text-xs font-bold text-white flex-1 ${
                  banModal.status === 'banned'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {banModal.status === 'banned' ? 'Unban' : 'Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
