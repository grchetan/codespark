import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import { authenticate, verifyToken, type AuthRequest } from '../auth';

const router = Router();

// Rate limiter for like/save — 30 per IP per 10 min
const interactionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many interactions. Please slow down.' },
});

// Rate limiter for effect submissions
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5, // 5 effect submissions per IP per hour
  message: { success: false, error: 'Too many submissions. Please try again later.' },
});

const ALLOWED_CATEGORIES = ['hover', 'text', 'cursor', '3d', 'loader', 'card', 'transition', 'creative', 'misc', 'transitions'];
const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];
const ALLOWED_SORT = ['new', 'popular', 'name', 'trending'];

// GET all effects with filtering, searching, and sorting
router.get('/', (req, res) => {
  try {
    const { cat, difficulty, q, sort } = req.query as Record<string, string>;
    let query = "SELECT * FROM effects WHERE status = 'published'";
    const params: any[] = [];

    if (cat && cat !== 'all') {
      // Allowlist category to prevent injection via query string
      if (ALLOWED_CATEGORIES.includes(cat.toLowerCase())) {
        query += ' AND category = ?';
        params.push(cat.toLowerCase());
      }
    }

    if (difficulty && difficulty !== 'all') {
      if (ALLOWED_DIFFICULTIES.includes(difficulty.toLowerCase())) {
        query += ' AND difficulty = ?';
        params.push(difficulty.toLowerCase());
      }
    }

    if (q && typeof q === 'string' && q.trim().length > 0 && q.length <= 200) {
      const search = `%${q.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)';
      params.push(search, search, search);
    }

    const sortParam = sort && ALLOWED_SORT.includes(sort) ? sort : 'trending';
    if (sortParam === 'new') query += ' ORDER BY created_at DESC';
    else if (sortParam === 'popular') query += ' ORDER BY views DESC';
    else if (sortParam === 'name') query += ' ORDER BY name ASC';
    else query += ' ORDER BY likes DESC';

    const rows = db.prepare(query).all(...params) as any[];

    const effects = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      image: r.image || '',
      category: r.category,
      categoryLabel: r.category_label,
      tags: JSON.parse(r.tags || '[]'),
      difficulty: r.difficulty,
      license: r.license,
      likes: r.likes,
      saves: r.saves,
      views: r.views,
      html_code: r.html_code,
      css_code: r.css_code,
      js_code: r.js_code,
      instructions: r.instructions || '',
      steps: JSON.parse(r.steps || '[]'),
      author: {
        id: r.author_id,
        name: r.author_name,
        handle: r.author_handle,
        avatar: r.author_avatar,
        role: 'Creative Developer',
        followers: 12000,
        effects: 10,
        bio: '',
        tags: ['hover', 'motion'],
      },
      createdAt: r.created_at,
      interactions: ['hover', 'motion'],
    }));

    res.json({ success: true, count: effects.length, effects });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load effects.' });
  }
});

// GET single effect by slug or ID
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== 'string' || slug.length > 200) {
      return res.status(400).json({ success: false, error: 'Invalid effect identifier.' });
    }

    const r = db.prepare('SELECT * FROM effects WHERE slug = ? OR id = ?').get(slug, slug) as any;
    if (!r) {
      return res.status(404).json({ success: false, error: 'Effect not found.' });
    }

    db.prepare('UPDATE effects SET views = views + 1 WHERE id = ?').run(r.id);

    const effect = {
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      image: r.image || '',
      category: r.category,
      categoryLabel: r.category_label,
      tags: JSON.parse(r.tags || '[]'),
      difficulty: r.difficulty,
      license: r.license,
      likes: r.likes,
      saves: r.saves,
      views: r.views + 1,
      author: {
        id: r.author_id,
        name: r.author_name,
        handle: r.author_handle,
        avatar: r.author_avatar,
        role: 'Creator',
        followers: 12000,
        effects: 15,
        bio: '',
        tags: [],
      },
      html_code: r.html_code,
      css_code: r.css_code,
      js_code: r.js_code,
      instructions: r.instructions || '',
      steps: JSON.parse(r.steps || '[]'),
      createdAt: r.created_at,
      interactions: ['hover', 'motion'],
    };

    res.json({ success: true, effect });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load effect.' });
  }
});

// POST create/submit new effect — authentication required
router.post('/', submitLimiter, authenticate, (req: AuthRequest, res) => {
  try {
    const {
      name, category, difficulty = 'medium', license = 'MIT', description,
      tags = [], html_code, css_code, js_code = '', image = '', instructions = '', steps,
    } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 200) {
      return res.status(400).json({ success: false, error: 'Effect name must be 2–200 characters.' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }
    if (!html_code || typeof html_code !== 'string' || html_code.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'HTML code is required.' });
    }
    if (!css_code || typeof css_code !== 'string' || css_code.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'CSS code is required.' });
    }
    if (html_code.length > 50000 || css_code.length > 50000 || (js_code && js_code.length > 50000)) {
      return res.status(400).json({ success: false, error: 'Code exceeds maximum allowed size.' });
    }

    // SECURITY: Author identity comes from JWT — never from request body
    const authorId = req.user!.userId;
    const u = db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(authorId) as any;
    const finalAuthorName = u?.name || 'Community Member';
    const finalAuthorHandle = `@${(u?.name || 'maker').toLowerCase().replace(/\s+/g, '')}`;
    const finalAuthorAvatar = u?.avatar || '';

    const id = `e_${Date.now()}`;
    const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    const categoryLabels: Record<string, string> = {
      hover: 'Hover', text: 'Text', cursor: 'Cursor', '3d': '3D / Tilt',
      loader: 'Loaders', card: 'Cards', transition: 'Transitions', misc: 'Creative', creative: 'Creative', transitions: 'Transitions',
    };
    const categoryKey = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const categoryLabel = categoryLabels[categoryKey] || category;
    const now = new Date().toISOString().slice(0, 10);
    const parsedTags = Array.isArray(tags)
      ? tags.slice(0, 10).map((t: string) => String(t).slice(0, 50))
      : String(tags).split(',').map((t) => t.trim().slice(0, 50)).filter(Boolean).slice(0, 10);

    let finalSteps = steps;
    if (!finalSteps || (Array.isArray(finalSteps) && finalSteps.length === 0)) {
      const stepList: any[] = [
        { step: 1, title: 'HTML Markup', desc: 'Copy and paste the HTML structure.', code: html_code, lang: 'html' },
        { step: 2, title: 'CSS Styles', desc: 'Add the styles to your CSS bundle.', code: css_code, lang: 'css' },
      ];
      if (js_code && js_code.trim()) {
        stepList.push({ step: 3, title: 'JavaScript', desc: 'Attach event listeners after DOM mount.', code: js_code, lang: 'js' });
      }
      finalSteps = stepList;
    }
    const stepsString = typeof finalSteps === 'string' ? finalSteps : JSON.stringify(finalSteps);

    db.prepare(`
      INSERT INTO effects (
        id, slug, name, description, image, category, category_label, tags,
        difficulty, license, likes, saves, views, author_id, author_name,
        author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
    `).run(
      id, slug, name.trim(), (description || '').slice(0, 1000), image.slice(0, 500), categoryKey, categoryLabel,
      JSON.stringify(parsedTags), difficulty, license, authorId, finalAuthorName,
      finalAuthorHandle, finalAuthorAvatar, html_code, css_code, js_code,
      (instructions || '').slice(0, 2000), stepsString, now
    );

    // Record in submissions
    db.prepare(`
      INSERT INTO submissions (id, name, category, author_name, author_email, tags, difficulty, description, html_code, css_code, js_code, instructions, steps, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      `s_${Date.now()}`, name.trim(), categoryLabel, finalAuthorName, `${finalAuthorHandle}@community`,
      JSON.stringify(parsedTags), difficulty, (description || '').slice(0, 1000), html_code, css_code, js_code,
      (instructions || '').slice(0, 2000), stepsString, now
    );

    // Update user effect count
    db.prepare('UPDATE users SET effects_count = effects_count + 1 WHERE id = ?').run(authorId);

    res.status(201).json({ success: true, id, slug, message: 'Effect published to the CodeSpark library!' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to publish effect.' });
  }
});

// POST Like — rate limited, no authentication required (public interaction)
router.post('/:id/like', interactionLimiter, (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length > 100) {
      return res.status(400).json({ success: false, error: 'Invalid effect ID.' });
    }
    const existing = db.prepare('SELECT id FROM effects WHERE id = ? OR slug = ?').get(id, id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Effect not found.' });
    }
    db.prepare('UPDATE effects SET likes = likes + 1 WHERE id = ? OR slug = ?').run(id, id);
    res.json({ success: true, message: 'Liked.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to register like.' });
  }
});

// POST Save — rate limited, no authentication required
router.post('/:id/save', interactionLimiter, (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length > 100) {
      return res.status(400).json({ success: false, error: 'Invalid effect ID.' });
    }
    const existing = db.prepare('SELECT id FROM effects WHERE id = ? OR slug = ?').get(id, id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Effect not found.' });
    }
    db.prepare('UPDATE effects SET saves = saves + 1 WHERE id = ? OR slug = ?').run(id, id);
    res.json({ success: true, message: 'Saved.' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to register save.' });
  }
});

export default router;
