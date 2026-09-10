import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// SECURITY: JWT secret must be provided via environment variable.
// The server/index.ts fail-fast check ensures this is set before routes load.
// We use a cast here — env is guaranteed non-empty by the startup guard.
const JWT_SECRET = process.env.JWT_SECRET as string;

export type ServerUserRole = 'superadmin' | 'admin' | 'moderator' | 'member';

export interface TokenPayload {
  userId: string;
  email: string;
  role: ServerUserRole;
}

/**
 * Check whether an email belongs to the Super Admin / Owner.
 * Admin emails are configured ONLY via ADMIN_EMAILS env var — never hardcoded.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return envAdmins.includes(clean);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }); // reduced from 7d → 24h
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const token = header.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }

  // Elevate role if email matches Super Admin list
  if (isSuperAdminEmail(payload.email)) {
    payload.role = 'superadmin';
  }

  req.user = payload;
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    if (req.user?.role !== 'superadmin' && !isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, error: 'Super Admin access required.' });
    }
    next();
  });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin' && !isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }
    next();
  });
}

export function requireModerator(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    const role = req.user?.role;
    if (!['moderator', 'admin', 'superadmin'].includes(role || '') && !isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, error: 'Moderator access required.' });
    }
    next();
  });
}
