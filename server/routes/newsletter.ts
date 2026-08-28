import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.json({ success: true, message: "You're already subscribed! Fresh drops land in your inbox every week." });
    }

    const id = `nl_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO newsletter (id, email, subscribed_at) VALUES (?, ?, ?)').run(id, cleanEmail, now);

    res.json({ success: true, message: "You're in! Fresh effects land in your inbox every week." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Subscription failed.' });
  }
});

router.get('/', (req, res) => {
  try {
    const subscribers = db.prepare('SELECT * FROM newsletter ORDER BY subscribed_at DESC').all();
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
