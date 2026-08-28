import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, authenticate, type AuthRequest } from '../auth';

const router = Router();

// Sign up
router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const id = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString().slice(0, 10);
    const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=120&h=120&q=80`;

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, avatar, bio, effects_count, created_at)
      VALUES (?, ?, ?, ?, 'member', 'active', ?, '', 0, ?)
    `).run(id, name, email.toLowerCase(), passwordHash, avatar, now);

    const token = generateToken({ userId: id, email: email.toLowerCase(), role: 'member' });
    const user = { id, name, email: email.toLowerCase(), role: 'member', avatar, effects_count: 0 };

    res.json({ success: true, token, user, message: 'Account created successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Signup failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'This account has been banned. Please contact support.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      effects_count: user.effects_count
    };

    res.json({ success: true, token, user: userData, message: 'Signed in successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// Me / Profile
router.get('/me', authenticate, (req: AuthRequest, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, status, avatar, bio, effects_count, created_at FROM users WHERE id = ?').get(req.user?.userId) as any;
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
