import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { requireAdmin, requireSuperAdmin, requireModerator, type AuthRequest } from '../auth';

const router = Router();

// ── Rate limiter for all admin API endpoints ──────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  message: { success: false, error: 'Too many admin requests. Please slow down.' },
});

// ══════════════════════════════════════════════════════════════════════════════
// IMPORTANT SECURITY: Every route in this router is protected.
// requireAdmin   → admin + superadmin only
// requireModerator → moderator + admin + superadmin
// requireSuperAdmin → superadmin only
// actorRole is ALWAYS read from req.user (JWT-verified) — never from req.body
// ══════════════════════════════════════════════════════════════════════════════

// Dashboard Overview Stats — moderator and above
router.get('/overview', adminLimiter, requireModerator, (req, res) => {
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
      time: s.submitted_at,
    }));

    res.json({
      success: true,
      stats: { totalEffects, totalUsers, pendingReviews, bannedUsers, unreadMessages, monthlyViews: '520K' },
      recentActivity,
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load dashboard data.' });
  }
});

// Submissions — moderator and above
router.get('/submissions', adminLimiter, requireModerator, (_req, res) => {
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
      submittedAt: r.submitted_at,
    }));
    res.json({ success: true, submissions });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load submissions.' });
  }
});

router.patch('/submissions/:id/status', adminLimiter, requireModerator, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);

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
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update submission.' });
  }
});

// Official Effects — admin and above
router.get('/effects', adminLimiter, requireAdmin, (_req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, name, slug, category, category_label, description, difficulty, status, html_code, css_code, js_code, instructions, steps, created_at as updatedAt FROM effects ORDER BY created_at DESC'
    ).all() as any[];
    const effects = rows.map((r) => ({ ...r, steps: JSON.parse(r.steps || '[]'), code: r.css_code || '' }));
    res.json({ success: true, effects });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load effects.' });
  }
});

router.post('/effects', adminLimiter, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { name, category, html_code, css_code, js_code, description, difficulty = 'medium' } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 200) {
      return res.status(400).json({ success: false, error: 'Name is required (2–200 characters).' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }

    const id = `e_${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString().slice(0, 10);
    const finalHtml = html_code || `<button class="${slug}-btn"><span>${name}</span></button>`;
    const finalCss = css_code || `.${slug}-btn { padding: 14px 28px; background: #FF4D2E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`;
    const finalJs = js_code || '';

    const defaultSteps = JSON.stringify([
      { step: 1, title: 'HTML Markup', desc: 'Add element to your DOM.', code: finalHtml, lang: 'html' },
      { step: 2, title: 'CSS Styling', desc: 'Apply interaction styles.', code: finalCss, lang: 'css' },
    ]);

    db.prepare(`
      INSERT INTO effects (
        id, slug, name, description, image, category, category_label, tags,
        difficulty, license, likes, saves, views, author_id, author_name,
        author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status, created_at
      ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, 'MIT', 0, 0, 1, 'u_chetan', 'Chetan Prajapat', '@chetan', '', ?, ?, ?, 'Official CodeSpark Effect', ?, 'published', ?)
    `).run(
      id, slug, name.trim(), description || `Official ${name} effect`,
      category.toLowerCase().replace(/[^a-z0-9]/g, ''), category, JSON.stringify([category.toLowerCase()]),
      difficulty, finalHtml, finalCss, finalJs, defaultSteps, now
    );

    res.json({ success: true, effectId: id, message: 'Official effect published!' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create effect.' });
  }
});

router.delete('/effects/:id', adminLimiter, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid effect ID.' });
    }
    const existing = db.prepare('SELECT id FROM effects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Effect not found.' });
    }
    db.prepare('DELETE FROM effects WHERE id = ?').run(id);
    res.json({ success: true, message: 'Effect removed.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete effect.' });
  }
});

// Users — admin and above
router.get('/users', adminLimiter, requireAdmin, (_req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, name, email, role, status, avatar, effects_count as effects, created_at as joined FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ success: true, users: rows });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load users.' });
  }
});

router.post('/users', adminLimiter, requireAdmin, (req, res) => {
  try {
    const { name, email, role = 'member', password = 'User@123' } = req.body;
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }
    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const id = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 12);
    const now = new Date().toISOString().slice(0, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, avatar, bio, effects_count, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', '', '', 0, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), passwordHash, role, now);

    res.json({ success: true, userId: id, message: `User ${name} created successfully.` });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
});

router.patch('/users/:id/status', adminLimiter, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // SECURITY: actorRole ALWAYS comes from the verified JWT, never from req.body
    const actorRole = req.user?.role;
    const actorEmail = req.user?.email;

    if (!['active', 'banned', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Protect Super Admin Owner from modification
    const superAdminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (superAdminEmails.includes(target.email) || target.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Cannot modify the Super Admin account.' });
    }

    // Non-superadmin cannot ban Admins
    if (target.role === 'admin' && actorRole !== 'superadmin' && !superAdminEmails.includes(actorEmail || '')) {
      return res.status(403).json({ success: false, error: 'Only the Super Admin can modify Administrator accounts.' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: `User status changed to ${status}.` });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
});

router.patch('/users/:id/role', adminLimiter, requireSuperAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // SECURITY: Only superadmin can change roles — enforced by requireSuperAdmin middleware.
    // actorRole comes from JWT — never from req.body
    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role. Allowed: admin, moderator, member.' });
    }

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const superAdminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (superAdminEmails.includes(target.email) || target.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Cannot modify the Super Admin role.' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ success: true, message: `User role changed to ${role}.` });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
});

// Requirements — admin and above
router.get('/requirements', adminLimiter, requireAdmin, (_req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, title, description, type, priority, status, votes, requested_by as requestedBy, requested_at as requestedAt FROM requirements ORDER BY votes DESC'
    ).all();
    res.json({ success: true, requirements: rows });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load requirements.' });
  }
});

router.post('/requirements', adminLimiter, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { title, description, type = 'feature', priority = 'medium' } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Title is required (min 3 characters).' });
    }

    const id = `r_${Date.now()}`;
    const now = new Date().toISOString().slice(0, 10);
    // Use authenticated user's name from JWT — not user-supplied body
    const requestedBy = req.user?.email || 'Admin';

    db.prepare(`
      INSERT INTO requirements (id, title, description, type, priority, status, votes, requested_by, requested_at)
      VALUES (?, ?, ?, ?, ?, 'open', 1, ?, ?)
    `).run(id, title.trim(), (description || '').slice(0, 2000), type, priority, requestedBy, now);

    res.json({ success: true, requirementId: id, message: 'Requirement added!' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to add requirement.' });
  }
});

router.patch('/requirements/:id', adminLimiter, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, vote } = req.body;

    const allowedStatuses = ['open', 'in_progress', 'completed', 'rejected', 'planned'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    if (status) {
      db.prepare('UPDATE requirements SET status = ? WHERE id = ?').run(status, id);
    }
    if (vote === true || vote === 1) {
      db.prepare('UPDATE requirements SET votes = votes + 1 WHERE id = ?').run(id);
    }

    res.json({ success: true, message: 'Requirement updated.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update requirement.' });
  }
});

// Contact Messages — moderator and above
router.get('/messages', adminLimiter, requireModerator, (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY submitted_at DESC').all() as any[];
    res.json({ success: true, messages: rows });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load messages.' });
  }
});

router.patch('/messages/:id/status', adminLimiter, requireModerator, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['unread', 'read', 'replied', 'archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: `Message marked as ${status}.` });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update message.' });
  }
});

router.delete('/messages/:id', adminLimiter, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM contact_messages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    res.json({ success: true, message: 'Message deleted.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete message.' });
  }
});

// Maintenance Mode — superadmin only
router.get('/maintenance', adminLimiter, requireModerator, (_req, res) => {
  try {
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('maintenance_mode') as any;
    res.json({ success: true, maintenance: row ? row.value === 'true' : false });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get maintenance status.' });
  }
});

router.post('/maintenance', adminLimiter, requireSuperAdmin, (req, res) => {
  try {
    const { maintenance } = req.body;
    if (typeof maintenance !== 'boolean') {
      return res.status(400).json({ success: false, error: 'maintenance must be a boolean.' });
    }
    const value = maintenance ? 'true' : 'false';
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('maintenance_mode', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(value, now);

    res.json({
      success: true,
      maintenance,
      message: maintenance ? 'Maintenance mode is now ACTIVE.' : 'Site is now LIVE.',
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update maintenance mode.' });
  }
});

export default router;
