import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

// Dashboard Overview Stats
router.get('/overview', (req, res) => {
  try {
    const totalEffects = (db.prepare('SELECT COUNT(*) as c FROM effects').get() as any).c;
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const pendingReviews = (db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'pending'").get() as any).c;
    const bannedUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'banned'").get() as any).c;
    const unreadMessages = (db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'unread'").get() as any).c;

    const recentSubs = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 8').all() as any[];
    const recentActivity = recentSubs.map((s, i) => ({
      id: `act_${s.id || i}`,
      action: s.status === 'approved' ? 'approved' : s.status === 'rejected' ? 'rejected' : 'submitted',
      target: s.name,
      by: s.author_name || 'Community Member',
      time: s.submitted_at
    }));

    res.json({
      success: true,
      stats: {
        totalEffects,
        totalUsers,
        pendingReviews,
        bannedUsers,
        unreadMessages,
        monthlyViews: '520K'
      },
      recentActivity
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submissions (with executable code for live admin inspection)
router.get('/submissions', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all() as any[];
    const submissions = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      author: r.author_name,
      email: r.author_email,
      tags: JSON.parse(r.tags || '[]'),
      difficulty: r.difficulty || 'medium',
      description: r.description || '',
      html_code: r.html_code || '',
      css_code: r.css_code || '',
      js_code: r.js_code || '',
      instructions: r.instructions || '',
      steps: JSON.parse(r.steps || '[]'),
      status: r.status,
      submittedAt: r.submitted_at
    }));
    res.json({ success: true, submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/submissions/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);

    // If approved, make sure it is published in effects table
    if (status === 'approved') {
      const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) as any;
      if (sub) {
        const slugBase = sub.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const effectId = `e_${sub.id.replace(/^s_/, '')}`;
        const existing = db.prepare('SELECT id FROM effects WHERE slug LIKE ? OR id = ?').get(`${slugBase}%`, effectId) as any;

        if (!existing) {
          const now = new Date().toISOString().slice(0, 10);
          db.prepare(`
            INSERT INTO effects (
              id, slug, name, description, image, category, category_label, tags,
              difficulty, license, likes, saves, views, author_id, author_name,
              author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status, created_at
            ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, 'MIT', 0, 0, 1, 'community', ?, ?, '', ?, ?, ?, ?, ?, 'published', ?)
          `).run(
            effectId,
            `${slugBase}-${Math.floor(Math.random() * 1000)}`,
            sub.name,
            sub.description || '',
            sub.category.toLowerCase().replace(/[^a-z0-9]/g, ''),
            sub.category,
            sub.tags || '[]',
            sub.difficulty || 'medium',
            sub.author_name,
            `@${sub.author_name.toLowerCase().replace(/\s+/g, '')}`,
            sub.html_code || '',
            sub.css_code || '',
            sub.js_code || '',
            sub.instructions || 'Follow step instructions below.',
            sub.steps || '[]',
            now
          );
        } else {
          db.prepare("UPDATE effects SET status = 'published' WHERE id = ?").run(existing.id);
        }
      }
    }

    res.json({ success: true, message: `Submission updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Official Effects
router.get('/effects', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, slug, category, category_label, description, difficulty, status, html_code, css_code, js_code, instructions, steps, created_at as updatedAt FROM effects ORDER BY created_at DESC').all() as any[];
    const effects = rows.map((r) => ({
      ...r,
      steps: JSON.parse(r.steps || '[]'),
      code: r.css_code || ''
    }));
    res.json({ success: true, effects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/effects', (req, res) => {
  try {
    const { name, category, html_code, css_code, js_code, description, difficulty = 'medium' } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Name and category are required' });
    }

    const id = `e_${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString().slice(0, 10);
    const finalHtml = html_code || `<button class="${slug}-btn"><span>${name}</span></button>`;
    const finalCss = css_code || `.${slug}-btn { padding: 14px 28px; background: #FF4D2E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`;
    const finalJs = js_code || '';

    const defaultSteps = JSON.stringify([
      { step: 1, title: 'HTML Markup', desc: 'Add element to your DOM.', code: finalHtml, lang: 'html' },
      { step: 2, title: 'CSS Styling', desc: 'Apply interaction styles.', code: finalCss, lang: 'css' }
    ]);

    db.prepare(`
      INSERT INTO effects (
        id, slug, name, description, image, category, category_label, tags,
        difficulty, license, likes, saves, views, author_id, author_name,
        author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status, created_at
      ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, 'MIT', 0, 0, 1, 'u_chetan', 'Chetan Prajapat', '@chetan', '', ?, ?, ?, 'Official CodeSpark Effect', ?, 'published', ?)
    `).run(
      id, slug, name, description || `Official ${name} effect created by Chetan Prajapat`,
      category.toLowerCase().replace(/[^a-z0-9]/g, ''), category, JSON.stringify([category.toLowerCase()]),
      difficulty, finalHtml, finalCss, finalJs, defaultSteps, now
    );

    res.json({ success: true, effectId: id, message: 'Official effect published!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/effects/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM effects WHERE id = ?').run(id);
    res.json({ success: true, message: 'Effect removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users
router.get('/users', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, role, status, avatar, effects_count as effects, created_at as joined FROM users ORDER BY created_at DESC').all();
    res.json({ success: true, users: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/users', (req, res) => {
  try {
    const { name, email, role = 'member', password = 'User@123' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const id = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString().slice(0, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, avatar, bio, effects_count, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', '', 0, ?)
    `).run(id, name.trim(), email.trim(), passwordHash, role, now);

    res.json({ success: true, userId: id, message: `User ${name} created successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, actorRole } = req.body;
    if (!['active', 'banned', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Protect Super Admin Owner
    if (target.email === 'chetanprajapat340@gmail.com' || target.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Cannot modify Super Admin status' });
    }

    // Non-superadmin cannot ban other admins
    if (target.role === 'admin' && actorRole !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can ban Administrators' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: `User status changed to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role, actorRole } = req.body;
    if (!['superadmin', 'admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Protect Super Admin Owner
    if (target.email === 'chetanprajapat340@gmail.com' || target.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Cannot modify Super Admin role' });
    }

    // Only Super Admin can promote to Admin or demote Admins
    if ((role === 'admin' || role === 'superadmin' || target.role === 'admin') && actorRole !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin (Owner) can manage Admin roles' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ success: true, message: `User role changed to ${role}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Requirements / Feature Requests
router.get('/requirements', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, title, description, type, priority, status, votes, requested_by as requestedBy, requested_at as requestedAt FROM requirements ORDER BY votes DESC').all();
    res.json({ success: true, requirements: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/requirements', (req, res) => {
  try {
    const { title, description, type = 'feature', priority = 'medium', requestedBy = 'Chetan Prajapat' } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const id = `r_${Date.now()}`;
    const now = new Date().toISOString().slice(0, 10);
    db.prepare(`
      INSERT INTO requirements (id, title, description, type, priority, status, votes, requested_by, requested_at)
      VALUES (?, ?, ?, ?, ?, 'open', 1, ?, ?)
    `).run(id, title, description || '', type, priority, requestedBy, now);

    res.json({ success: true, requirementId: id, message: 'Requirement added!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/requirements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, vote } = req.body;

    if (status) {
      db.prepare('UPDATE requirements SET status = ? WHERE id = ?').run(status, id);
    }
    if (vote) {
      db.prepare('UPDATE requirements SET votes = votes + 1 WHERE id = ?').run(id);
    }

    res.json({ success: true, message: 'Requirement updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Contact Messages / Inquiries (NEW feature for admin console!)
router.get('/messages', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY submitted_at DESC').all() as any[];
    res.json({ success: true, messages: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/messages/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: `Message marked as ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/messages/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// System Maintenance / Testing Mode Management
router.get('/maintenance', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('maintenance_mode') as any;
    const isMaintenance = row ? row.value === 'true' : false;
    res.json({ success: true, maintenance: isMaintenance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/maintenance', (req, res) => {
  try {
    const { maintenance } = req.body;
    const value = maintenance ? 'true' : 'false';
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('maintenance_mode', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(value, now);

    res.json({
      success: true,
      maintenance: maintenance === true,
      message: maintenance ? 'Maintenance / Testing mode is now ACTIVE' : 'Site is now LIVE to public visitors'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
