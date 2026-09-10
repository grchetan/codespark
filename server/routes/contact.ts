import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

// Rate limit public contact form submissions — 5 per IP per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many messages sent. Please try again later.' },
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Public: submit contact form
router.post('/', contactLimiter, (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be 2–100 characters.' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
      return res.status(400).json({ success: false, error: 'Message must be 10–5000 characters.' });
    }

    const id = `msg_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, topic, message, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'unread')
    `).run(
      id,
      name.trim().slice(0, 100),
      email.trim().toLowerCase().slice(0, 254),
      (topic || 'General question').slice(0, 100),
      message.trim().slice(0, 5000),
      now
    );

    res.json({ success: true, message: 'Message received! We usually reply within 1 business day.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to submit message. Please try again.' });
  }
});

// SECURED: Admin-only — view all messages
router.get('/messages', requireAdmin, (_req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY submitted_at DESC').all();
    res.json({ success: true, count: (messages as any[]).length, messages });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load messages.' });
  }
});

export default router;
