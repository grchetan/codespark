import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

// Rate limit newsletter subscriptions — 3 per IP per hour
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, error: 'Too many subscription attempts. Please try again later.' },
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Public: subscribe
router.post('/', newsletterLimiter, (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(cleanEmail);
    if (existing) {
      // Don't confirm whether email exists (privacy)
      return res.json({ success: true, message: "You're all set! Fresh effects land in your inbox every week." });
    }

    const id = `nl_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO newsletter (id, email, subscribed_at) VALUES (?, ?, ?)').run(id, cleanEmail, now);

    res.json({ success: true, message: "You're in! Fresh effects land in your inbox every week." });
  } catch {
    res.status(500).json({ success: false, error: 'Subscription failed. Please try again.' });
  }
});

// SECURED: Admin-only — view all subscribers
router.get('/', requireAdmin, (_req, res) => {
  try {
    const subscribers = db.prepare('SELECT id, email, subscribed_at FROM newsletter ORDER BY subscribed_at DESC').all();
    res.json({ success: true, count: (subscribers as any[]).length, subscribers });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load subscribers.' });
  }
});

export default router;
