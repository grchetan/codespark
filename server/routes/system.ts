import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Public endpoint to check system maintenance mode
router.get('/maintenance', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('maintenance_mode') as any;
    const isMaintenance = row ? row.value === 'true' : false;

    res.json({
      success: true,
      maintenance: isMaintenance,
      title: 'CodeSpark Scheduled Maintenance',
      message: "We're currently upgrading the interactive engine, adding verified micro-interactions, and optimizing server performance. We'll be back shortly!"
    });
  } catch (err: any) {
    res.json({ success: true, maintenance: false });
  }
});

export default router;
