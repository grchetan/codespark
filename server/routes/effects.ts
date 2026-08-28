import { Router } from 'express';
import { db } from '../db';
import { verifyToken } from '../auth';

const router = Router();

// GET all effects with filtering, searching, and sorting
router.get('/', (req, res) => {
  try {
    const { cat, difficulty, q, sort } = req.query as Record<string, string>;
    let query = "SELECT * FROM effects WHERE status = 'published'";
    const params: any[] = [];

    if (cat && cat !== 'all') {
      query += ' AND category = ?';
      params.push(cat);
    }

    if (difficulty && difficulty !== 'all') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (q && q.trim()) {
      const search = `%${q.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)';
      params.push(search, search, search);
    }

    if (sort === 'new') {
      query += ' ORDER BY created_at DESC';
    } else if (sort === 'popular') {
      query += ' ORDER BY views DESC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      // Default: trending by likes
      query += ' ORDER BY likes DESC';
    }

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
        tags: ['hover', 'motion']
      },
      createdAt: r.created_at,
      interactions: ['hover', 'motion']
    }));

    res.json({ success: true, count: effects.length, effects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single effect by slug or ID
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const r = db.prepare('SELECT * FROM effects WHERE slug = ? OR id = ?').get(slug, slug) as any;
    if (!r) {
      return res.status(404).json({ success: false, error: 'Effect not found' });
    }

    // Increment views
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
        tags: []
      },
      html_code: r.html_code,
      css_code: r.css_code,
      js_code: r.js_code,
      instructions: r.instructions || '',
      steps: JSON.parse(r.steps || '[]'),
      createdAt: r.created_at,
      interactions: ['hover', 'motion']
    };

    res.json({ success: true, effect });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create/submit new effect
router.post('/', (req, res) => {
  try {
    const {
      name, category, difficulty = 'medium', license = 'MIT', description,
      tags = [], html_code, css_code, js_code = '', image = '', instructions = '', steps,
      author_name, author_handle, author_avatar
    } = req.body;

    if (!name || !category || !html_code || !css_code) {
      return res.status(400).json({ success: false, error: 'Name, category, HTML and CSS code are required' });
    }

    // Check auth header if available
    let authorId = 'guest';
    let finalAuthorName = author_name || 'Community Member';
    let finalAuthorHandle = author_handle || '@maker';
    let finalAuthorAvatar = author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) {
        authorId = payload.userId;
        const u = db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(payload.userId) as any;
        if (u) {
          finalAuthorName = u.name;
          finalAuthorHandle = `@${u.name.toLowerCase().replace(/\s+/g, '')}`;
          if (u.avatar) finalAuthorAvatar = u.avatar;
        }
      }
    }

    const id = `e_${Date.now()}`;
    const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    const categoryLabels: Record<string, string> = {
      hover: 'Hover',
      text: 'Text',
      cursor: 'Cursor',
      '3d': '3D / Tilt',
      loader: 'Loaders',
      card: 'Cards',
      transition: 'Transitions',
      misc: 'Creative'
    };

    const categoryKey = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const categoryLabel = categoryLabels[categoryKey] || category;
    const now = new Date().toISOString().slice(0, 10);
    const parsedTags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);

    // Formulate steps if not provided
    let finalSteps = steps;
    if (!finalSteps || (Array.isArray(finalSteps) && finalSteps.length === 0)) {
      const stepList = [
        { step: 1, title: 'HTML Markup', desc: 'Copy and paste the HTML structure into your component or page.', code: html_code, lang: 'html' },
        { step: 2, title: 'CSS Styles', desc: 'Include the stylesheet or add the styles to your CSS / Tailwind bundle.', code: css_code, lang: 'css' }
      ];
      if (js_code && js_code.trim()) {
        stepList.push({ step: 3, title: 'JavaScript Execution', desc: 'Attach event listeners or run the script after the DOM is mounted.', code: js_code, lang: 'js' });
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
      id, slug, name.trim(), description || '', image || '', categoryKey, categoryLabel,
      JSON.stringify(parsedTags), difficulty, license, authorId, finalAuthorName,
      finalAuthorHandle, finalAuthorAvatar, html_code, css_code, js_code,
      instructions || 'Follow the step-by-step instructions below to integrate this effect into your project.',
      stepsString, now
    );

    // Also record in submissions
    db.prepare(`
      INSERT INTO submissions (id, name, category, author_name, author_email, tags, difficulty, description, html_code, css_code, js_code, instructions, steps, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      `s_${Date.now()}`, name.trim(), categoryLabel, finalAuthorName, `${finalAuthorHandle}@community`,
      JSON.stringify(parsedTags), difficulty, description || '', html_code, css_code, js_code,
      instructions || '', stepsString, now
    );

    // Update user effect count
    if (authorId !== 'guest') {
      db.prepare('UPDATE users SET effects_count = effects_count + 1 WHERE id = ?').run(authorId);
    }

    res.json({
      success: true,
      id,
      slug,
      message: 'Effect published successfully to the CodeSpark library!'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Like effect
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE effects SET likes = likes + 1 WHERE id = ? OR slug = ?').run(id, id);
    res.json({ success: true, message: 'Liked' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Save effect
router.post('/:id/save', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE effects SET saves = saves + 1 WHERE id = ? OR slug = ?').run(id, id);
    res.json({ success: true, message: 'Saved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
