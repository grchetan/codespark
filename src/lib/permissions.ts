/**
 * CodeSpark Central Role-Based Access Control (RBAC) System
 * Defines roles, permissions, capabilities, and security validation helpers.
 */

export type UserRole = 'superadmin' | 'admin' | 'moderator' | 'member';

export type PermissionKey =
  | 'dashboard.view'
  | 'effects.manage'
  | 'verifications.view'
  | 'verifications.manage'
  | 'users.view'
  | 'users.manage_members'       // Admin & Superadmin can ban/unban members/moderators & change member <-> moderator
  | 'users.manage_admins'        // ONLY Super Admin can promote/demote admins or ban admins
  | 'requirements.manage'
  | 'inquiries.manage'
  | 'settings.manage'           // ONLY Super Admin
  | 'security.manage';           // ONLY Super Admin

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  admin: 50,
  moderator: 20,
  member: 10,
};

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  superadmin: [
    'dashboard.view',
    'effects.manage',
    'verifications.view',
    'verifications.manage',
    'users.view',
    'users.manage_members',
    'users.manage_admins',
    'requirements.manage',
    'inquiries.manage',
    'settings.manage',
    'security.manage',
  ],
  admin: [
    'dashboard.view',
    'effects.manage',
    'verifications.view',
    'verifications.manage',
    'users.view',
    'users.manage_members',
    'requirements.manage',
    'inquiries.manage',
  ],
  moderator: [
    'dashboard.view',
    'verifications.view',
    'verifications.manage',
    'inquiries.manage',
  ],
  member: [],
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: UserRole | string | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false;
  const userRole = role.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if an email or role represents the root Super Admin / Owner
 */
export function isSuperAdminOwner(email?: string | null, role?: string | null): boolean {
  if (role === 'superadmin') return true;
  if (!email) return false;
  const clean = email.trim().toLowerCase();

  const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdmins.includes(clean)) return true;
  if (clean === 'chetanprajapat340@gmail.com') return true;

  return false;
}

/**
 * Returns allowed role transitions for a target user by an actor
 */
export function getAllowedRoleOptions(
  actorRole: UserRole,
  targetUserRole: UserRole,
  isTargetOwner: boolean
): Array<{ value: UserRole; label: string }> {
  // Nobody can modify the Super Admin / Owner
  if (isTargetOwner || targetUserRole === 'superadmin') {
    return [];
  }

  // Super Admin can change to any non-superadmin role
  if (actorRole === 'superadmin') {
    return [
      { value: 'member', label: 'Member' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'admin', label: 'Admin' },
    ];
  }

  // Admin can ONLY toggle between Member and Moderator (CANNOT create Admin or modify Admins)
  if (actorRole === 'admin') {
    if (targetUserRole === 'admin') {
      return []; // Admin cannot modify another Admin
    }
    return [
      { value: 'member', label: 'Member' },
      { value: 'moderator', label: 'Moderator' },
    ];
  }

  // Moderators & Members cannot change roles
  return [];
}

/**
 * Check if the actor has permission to ban or unban a target user
 */
export function canBanUser(
  actorRole: UserRole,
  targetUserRole: UserRole,
  isTargetOwner: boolean
): boolean {
  // Super Admin Owner can never be banned
  if (isTargetOwner || targetUserRole === 'superadmin') {
    return false;
  }

  // Super Admin can ban anyone (except themselves)
  if (actorRole === 'superadmin') {
    return true;
  }

  // Admin can ban members and moderators only (cannot ban Admins or Superadmin)
  if (actorRole === 'admin') {
    return targetUserRole === 'member' || targetUserRole === 'moderator';
  }

  return false;
}

/**
 * Check which Admin Panel tabs are accessible for a given role
 */
export function getAccessibleTabs(role: UserRole): string[] {
  switch (role) {
    case 'superadmin':
      return ['overview', 'verifications', 'official', 'users', 'requirements', 'banned', 'messages', 'settings'];
    case 'admin':
      return ['overview', 'verifications', 'official', 'users', 'requirements', 'banned', 'messages'];
    case 'moderator':
      return ['overview', 'verifications', 'banned', 'messages'];
    default:
      return [];
  }
}
