import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, authenticate, type AuthRequest } from '../auth';

const router = Router();

// ── Strict rate limiter for auth endpoints ───────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failures
});

// Basic email format check
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Sign up
router.post('/signup', authLimiter, (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be 2–100 characters.' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, error: 'Password must be 8–128 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      // Generic message — do not confirm whether the email exists (account enumeration)
      return res.status(400).json({ success: false, error: 'Unable to create account with these details.' });
    }

    const id = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 12); // cost factor 12
    const cleanSeed = encodeURIComponent(name.trim() || cleanEmail);
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanSeed}`;
    const now = new Date().toISOString().slice(0, 10); // FIX H10: was undefined

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, avatar, bio, effects_count, created_at)
      VALUES (?, ?, ?, ?, 'member', 'active', ?, '', 0, ?)
    `).run(id, name.trim(), cleanEmail, passwordHash, avatar, now);

    const token = generateToken({ userId: id, email: cleanEmail, role: 'member' });
    const user = { id, name: name.trim(), email: cleanEmail, role: 'member', avatar, effects_count: 0 };

    res.status(201).json({ success: true, token, user, message: 'Account created successfully!' });
  } catch {
    res.status(500).json({ success: false, error: 'Account creation failed. Please try again.' });
  }
});

// Login
router.post('/login', authLimiter, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length > 128) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;

    // SECURITY: Same generic error for missing user and wrong password (prevents account enumeration)
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'This account has been suspended. Please contact support.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      effects_count: user.effects_count,
    };

    res.json({ success: true, token, user: userData, message: 'Signed in successfully.' });
  } catch {
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// Me / Profile — requires authentication
router.get('/me', authenticate, (req: AuthRequest, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, role, status, avatar, bio, effects_count, created_at FROM users WHERE id = ?'
    ).get(req.user?.userId) as any;

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load profile.' });
  }
});

export default router;
