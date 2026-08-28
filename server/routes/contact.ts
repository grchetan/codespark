import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { name, email, topic, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const id = `msg_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, topic, message, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'unread')
    `).run(id, name.trim(), email.trim().toLowerCase(), topic || 'General question', message.trim(), now);

    res.json({ success: true, message: 'Message received! We usually reply within 1 business day.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to submit contact message.' });
  }
});

router.get('/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY submitted_at DESC').all();
    res.json({ success: true, count: messages.length, messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
