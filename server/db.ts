import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'effekt.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDb() {
  // 1. Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      status TEXT DEFAULT 'active',
      avatar TEXT,
      bio TEXT,
      effects_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Create Effects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS effects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT NOT NULL,
      category_label TEXT NOT NULL,
      tags TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      license TEXT DEFAULT 'MIT',
      likes INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      author_id TEXT,
      author_name TEXT,
      author_handle TEXT,
      author_avatar TEXT,
      html_code TEXT NOT NULL,
      css_code TEXT NOT NULL,
      js_code TEXT,
      instructions TEXT,
      steps TEXT,
      status TEXT DEFAULT 'published',
      created_at TEXT NOT NULL
    );
  `);

  // 3. Create Submissions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      tags TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      description TEXT,
      html_code TEXT,
      css_code TEXT,
      js_code TEXT,
      instructions TEXT,
      steps TEXT,
      status TEXT DEFAULT 'pending',
      submitted_at TEXT NOT NULL
    );
  `);

  // 4. Create Requirements Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'feature',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      votes INTEGER DEFAULT 0,
      requested_by TEXT NOT NULL,
      requested_at TEXT NOT NULL
    );
  `);

  // 5. Create Newsletter Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TEXT NOT NULL
    );
  `);

  // 6. Create Contact Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      topic TEXT NOT NULL,
      message TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT DEFAULT 'unread'
    );
  `);

  // 7. Create User Interactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_interactions (
      user_id TEXT NOT NULL,
      effect_id TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, effect_id, type)
    );
  `);

  // Run schema migrations for existing DB
  try { db.exec(`ALTER TABLE effects ADD COLUMN instructions TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE effects ADD COLUMN steps TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE submissions ADD COLUMN instructions TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE submissions ADD COLUMN steps TEXT;`); } catch {}

  seedData();
}

function seedData() {
  const defaultPassword = bcrypt.hashSync('Admin@123', 10);
  const now = new Date().toISOString().slice(0, 10);

  // Always Upsert Admin & Creator Accounts
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role, status, avatar, bio, effects_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('u_admin_codespark', 'Chetan Prajapat', 'admin@codespark.dev', defaultPassword, 'admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'CodeSpark Platform Founder & Lead Architect', 18, now);
  insertUser.run('u_chetan', 'Chetan Prajapat', 'chetan@codespark.dev', defaultPassword, 'admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'CodeSpark Platform Founder & Lead Architect', 18, now);
  insertUser.run('u_admin', 'Chetan Prajapat', 'admin@effekt.dev', defaultPassword, 'admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'CodeSpark Platform Founder & Lead Architect', 18, now);
  insertUser.run('c1', 'Mara Voss', 'mara@codespark.dev', defaultPassword, 'member', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'Pushing pixels and easing curves since the jQuery days.', 32, '2026-07-02');
  insertUser.run('c2', 'Kenji Sato', 'kenji@codespark.dev', defaultPassword, 'member', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', 'I build tiny interactions that make big interfaces feel alive.', 21, '2026-07-11');
  insertUser.run('c3', 'Ava Laurent', 'ava@codespark.dev', defaultPassword, 'member', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', 'Type is a playground. Most of my work lives between two keyframes.', 47, '2026-07-18');
  insertUser.run('c4', 'Dimitri Okafor', 'dimi@codespark.dev', defaultPassword, 'member', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', 'Loaders, states and micro-moments. Performance obsessed.', 15, '2026-07-25');
  insertUser.run('c5', 'Noor Haddad', 'noor@codespark.dev', defaultPassword, 'moderator', 'active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80', 'Where design systems meet the canvas. I ship the in-between.', 58, '2026-05-20');
  insertUser.run('c6', 'Theo Marchand', 'theo@codespark.dev', defaultPassword, 'member', 'active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80', 'Shaders by night, semantic HTML by day.', 26, '2026-08-01');

  console.log('🌱 Seeding/Refreshing full CodeSpark effects database with step-by-step instructions...');

  const insertEffect = db.prepare(`
    INSERT OR REPLACE INTO effects (
      id, slug, name, description, image, category, category_label, tags,
      difficulty, license, likes, saves, views, author_id, author_name,
      author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialEffectsData = [
    {
      id: 'e1', slug: 'magnetic-button', name: 'Magnetic Button', category: 'hover', categoryLabel: 'Hover',
      description: 'A CTA that is subtly pulled toward your cursor — the button leans in just before you commit.',
      image: '',
      tags: ['magnetic', 'button', 'cursor', 'micro-interaction'], difficulty: 'medium', license: 'MIT',
      likes: 4820, saves: 1730, views: 96000, author_id: 'c1', author_name: 'Mara Voss', author_handle: '@mara',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<button class="magnetic-btn">Magnetic CTA</button>`,
      css_code: `.magnetic-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  background: #FF4D2E;
  color: #FAF6EE;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 46, 0.35);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}
.magnetic-btn:hover {
  box-shadow: 0 8px 24px rgba(255, 77, 46, 0.5);
}`,
      js_code: `const btn = document.querySelector('.magnetic-btn');
if (btn) {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.35;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    btn.style.transform = \`translate(\${x}px, \${y}px)\`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
}`,
      instructions: 'Include the button HTML in your template, add the CSS styles for easing and shadow, and attach the mousemove listener in JavaScript to calculate the offset.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Markup', desc: 'Add the magnetic button element inside your component or page.', code: `<button class="magnetic-btn">Magnetic CTA</button>`, lang: 'html' },
        { step: 2, title: 'CSS Smooth Easing', desc: 'Apply the cubic-bezier transition to produce the elastic snapping feel.', code: `.magnetic-btn { padding: 14px 28px; border: none; border-radius: 8px; background: #FF4D2E; color: #FAF6EE; font-weight: 600; cursor: pointer; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }`, lang: 'css' },
        { step: 3, title: 'JavaScript Physics Listener', desc: 'Calculate the cursor offset relative to the center and translate the button.', code: `const btn = document.querySelector('.magnetic-btn');\nbtn.addEventListener('mousemove', (e) => {\n  const r = btn.getBoundingClientRect();\n  const x = (e.clientX - r.left - r.width / 2) * 0.35;\n  const y = (e.clientY - r.top - r.height / 2) * 0.35;\n  btn.style.transform = \`translate(\${x}px, \${y}px)\`;\n});\nbtn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });`, lang: 'js' }
      ]),
      created_at: '2026-08-01'
    },
    {
      id: 'e2', slug: '3d-tilt-card', name: '3D Tilt Card', category: '3d', categoryLabel: '3D / Tilt',
      description: 'A perspective card that rotates on the X and Y axes as you move, with a glare highlight that follows.',
      image: '',
      tags: ['3d', 'perspective', 'card', 'tilt'], difficulty: 'medium', license: 'MIT',
      likes: 9310, saves: 4020, views: 210000, author_id: 'c2', author_name: 'Kenji Sato', author_handle: '@kenji',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="tilt-card-box">
  <div class="tilt-inner">
    <div class="tilt-tag">3D PERSPECTIVE</div>
    <h3>Interactive Tilt Card</h3>
    <p>Hover and move cursor to experience dynamic 3D depth and shadows.</p>
  </div>
</div>`,
      css_code: `.tilt-card-box {
  perspective: 900px;
  display: inline-block;
}
.tilt-inner {
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
  border-radius: 14px;
  padding: 28px;
  width: 280px;
  background: linear-gradient(135deg, #1d1a16 0%, #2a221c 100%);
  border: 1px solid rgba(255, 77, 46, 0.3);
  color: #FAF6EE;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
}
.tilt-tag {
  font-size: 10px;
  font-weight: 700;
  color: #FF4D2E;
  letter-spacing: 0.15em;
  margin-bottom: 8px;
}
.tilt-inner h3 { margin-bottom: 6px; font-size: 16px; font-weight: 700; }
.tilt-inner p { font-size: 12px; color: #a9967f; line-height: 1.5; }`,
      js_code: `const card = document.querySelector('.tilt-inner');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -20;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 20;
    card.style.transform = \`rotateX(\${rx}deg) rotateY(\${ry}deg) scale3d(1.04, 1.04, 1.04)\`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}`,
      instructions: 'Place the perspective container in your HTML, style with transform-style: preserve-3d, and apply the tilt calculation on mousemove.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Wrapper & Card', desc: 'Create a wrapper with perspective and inner container.', code: `<div class="tilt-card-box"><div class="tilt-inner"><h3>3D Card</h3><p>Interactive depth</p></div></div>`, lang: 'html' },
        { step: 2, title: 'CSS 3D Engine', desc: 'Configure perspective, transform-style: preserve-3d, and transition curves.', code: `.tilt-card-box { perspective: 900px; }\n.tilt-inner { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }`, lang: 'css' },
        { step: 3, title: 'JS Tilt Coordinates', desc: 'Calculate rotational angles along X and Y axes.', code: `const card = document.querySelector('.tilt-inner');\ncard.addEventListener('mousemove', (e) => {\n  const r = card.getBoundingClientRect();\n  const rx = ((e.clientY - r.top) / r.height - 0.5) * -20;\n  const ry = ((e.clientX - r.left) / r.width - 0.5) * 20;\n  card.style.transform = \`rotateX(\${rx}deg) rotateY(\${ry}deg)\`;\n});\ncard.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0) rotateY(0)'; });`, lang: 'js' }
      ]),
      created_at: '2026-07-28'
    },
    {
      id: 'e3', slug: 'text-scramble', name: 'Text Scramble', category: 'text', categoryLabel: 'Text',
      description: 'Characters violently scramble and settle into the final word. Perfect for hero headlines and reveals.',
      image: '',
      tags: ['text', 'scramble', 'animation', 'decoder'], difficulty: 'advanced', license: 'BSD-2',
      likes: 7640, saves: 2980, views: 150000, author_id: 'c3', author_name: 'Ava Laurent', author_handle: '@ava',
      author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="scramble-wrapper">
  <span class="scramble-tag">HOVER ME</span>
  <h1 class="scramble" data-text="CODESPARK">CODESPARK</h1>
</div>`,
      css_code: `.scramble-wrapper { text-align: center; cursor: pointer; }
.scramble-tag { font-size: 11px; font-family: monospace; color: #7e6c60; letter-spacing: 0.2em; display: block; margin-bottom: 4px; }
.scramble {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.4rem;
  font-weight: 800;
  color: #FF4D2E;
  letter-spacing: 0.05em;
}`,
      js_code: `const el = document.querySelector('.scramble');
if (el) {
  const chars = '!<>-_\\\\/[]—=+*^?#';
  const target = el.getAttribute('data-text') || el.textContent;
  let frame = 0;
  const tick = () => {
    frame++;
    let out = '';
    for (let i = 0; i < target.length; i++) {
      if (frame / 3 > i) out += target[i];
      else out += chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    if (frame / 3 <= target.length) requestAnimationFrame(tick);
  };
  el.parentElement.addEventListener('mouseenter', () => { frame = 0; tick(); });
}`,
      instructions: 'Use a monospace font and requestAnimationFrame to progressively replace random glyphs with the target string.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Element with Data Attribute', desc: 'Provide data-text to store original content.', code: `<h1 class="scramble" data-text="CODESPARK">CODESPARK</h1>`, lang: 'html' },
        { step: 2, title: 'CSS Font Setup', desc: 'Use monospace font so character widths remain stable during scramble.', code: `.scramble { font-family: monospace; font-size: 2.4rem; font-weight: 700; color: #FF4D2E; }`, lang: 'css' },
        { step: 3, title: 'Frame Loop Decoder', desc: 'Loop random characters until frame count passes each index.', code: `const chars = '!<>-_\\\\/[]—=+*^?#';\nlet frame = 0;\nfunction tick() {\n  frame++; let out = '';\n  for (let i=0; i<target.length; i++) {\n    if (frame/3 > i) out += target[i];\n    else out += chars[Math.floor(Math.random()*chars.length)];\n  }\n  el.textContent = out;\n  if (frame/3 <= target.length) requestAnimationFrame(tick);\n}`, lang: 'js' }
      ]),
      created_at: '2026-08-10'
    },
    {
      id: 'e4', slug: 'cursor-spotlight', name: 'Cursor Spotlight', category: 'cursor', categoryLabel: 'Cursor',
      description: 'A radial spotlight that reveals the text beneath as your cursor glides across the section.',
      image: '',
      tags: ['cursor', 'spotlight', 'text', 'reveal'], difficulty: 'easy', license: 'MIT',
      likes: 5280, saves: 1890, views: 88000, author_id: 'c5', author_name: 'Noor Haddad', author_handle: '@noor',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="spotlight-box">
  <p class="spotlight-text">Move cursor to illuminate hidden interface layers.</p>
</div>`,
      css_code: `.spotlight-box {
  position: relative;
  background: #0F1115;
  color: #FAF6EE;
  padding: 32px 24px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  --x: 50%;
  --y: 50%;
}
.spotlight-box::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle 120px at var(--x) var(--y), rgba(255, 77, 46, 0.25), transparent 70%);
  pointer-events: none;
}
.spotlight-text {
  position: relative;
  z-index: 1;
  font-size: 13px;
  text-align: center;
}`,
      js_code: `const box = document.querySelector('.spotlight-box');
if (box) {
  box.addEventListener('mousemove', (e) => {
    const r = box.getBoundingClientRect();
    box.style.setProperty('--x', \`\${e.clientX - r.left}px\`);
    box.style.setProperty('--y', \`\${e.clientY - r.top}px\`);
  });
}`,
      instructions: 'Use CSS custom properties (--x, --y) in a radial gradient pseudo-element and update coordinates via mousemove.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Canvas Box', desc: 'Create the target container with text.', code: `<div class="spotlight-box"><p>Move cursor to illuminate layers.</p></div>`, lang: 'html' },
        { step: 2, title: 'CSS Radial Gradient Mask', desc: 'Define pseudo-element with CSS variables --x and --y.', code: `.spotlight-box::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle 120px at var(--x) var(--y), rgba(255, 77, 46, 0.3), transparent 70%); pointer-events: none; }`, lang: 'css' },
        { step: 3, title: 'JS CSS Variable Sync', desc: 'Pass mouse coordinates to CSS custom properties.', code: `const box = document.querySelector('.spotlight-box');\nbox.addEventListener('mousemove', (e) => {\n  const r = box.getBoundingClientRect();\n  box.style.setProperty('--x', \`\${e.clientX - r.left}px\`);\n  box.style.setProperty('--y', \`\${e.clientY - r.top}px\`);\n});`, lang: 'js' }
      ]),
      created_at: '2026-08-05'
    },
    {
      id: 'e5', slug: 'aurora-loader', name: 'Aurora Loader', category: 'loader', categoryLabel: 'Loaders',
      description: 'Three flowing blobs orbit a core, blending into a calm aurora while your content loads.',
      image: '',
      tags: ['loader', 'aurora', 'blur', 'css'], difficulty: 'easy', license: 'MIT',
      likes: 3140, saves: 1210, views: 52000, author_id: 'c4', author_name: 'Dimitri Okafor', author_handle: '@dimi',
      author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="aurora-stage">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>`,
      css_code: `.aurora-stage {
  position: relative;
  width: 70px;
  height: 70px;
}
.blob {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: blur(14px);
  animation: spin 3.5s linear infinite;
}
.b1 { background: #FF4D2E; }
.b2 { background: #10B981; animation-duration: 4.5s; animation-direction: reverse; }
.b3 { background: #3B82F6; animation-duration: 6s; }
@keyframes spin { 100% { transform: rotate(360deg) scale(1.1); } }`,
      js_code: '',
      instructions: 'Pure CSS animation using three overlapping blurred divs rotating with different speeds and directions.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Aurora Blobs', desc: 'Create 3 overlapping div blobs inside a stage.', code: `<div class="aurora-stage">\n  <div class="blob b1"></div>\n  <div class="blob b2"></div>\n  <div class="blob b3"></div>\n</div>`, lang: 'html' },
        { step: 2, title: 'CSS Blur & Orbit Animation', desc: 'Add heavy gaussian blur and asynchronous rotational keyframes.', code: `.blob { position: absolute; inset: 0; border-radius: 50%; filter: blur(14px); animation: spin 3.5s linear infinite; }\n.b1 { background: #FF4D2E; }\n.b2 { background: #10B981; animation-duration: 4.5s; animation-direction: reverse; }\n@keyframes spin { 100% { transform: rotate(360deg); } }`, lang: 'css' }
      ]),
      created_at: '2026-08-15'
    },
    {
      id: 'e6', slug: 'gradient-marquee-text', name: 'Gradient Marquee', category: 'text', categoryLabel: 'Text',
      description: 'An infinite horizontal marquee with a shifting gradient fill — loud, confident, on-brand.',
      image: '',
      tags: ['text', 'marquee', 'gradient', 'css'], difficulty: 'easy', license: 'MIT',
      likes: 4060, saves: 1540, views: 71000, author_id: 'c3', author_name: 'Ava Laurent', author_handle: '@ava',
      author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="marquee-track">
  <span>CODESPARK DROP ✦ INTERACTION DESIGN ✦ </span>
  <span>CODESPARK DROP ✦ INTERACTION DESIGN ✦ </span>
</div>`,
      css_code: `.marquee-track {
  display: flex;
  overflow: hidden;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  white-space: nowrap;
  background: linear-gradient(90deg, #FF4D2E, #10B981, #FF4D2E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.marquee-track span {
  display: inline-block;
  animation: marquee-anim 8s linear infinite;
}
@keyframes marquee-anim {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}`,
      js_code: '',
      instructions: 'Duplicate marquee text inside a flex container with overflow-hidden and apply translateX(-50%) animation.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Duplicate Track', desc: 'Place two identical text spans inside a track container.', code: `<div class="marquee-track"><span>CODESPARK ✦ </span><span>CODESPARK ✦ </span></div>`, lang: 'html' },
        { step: 2, title: 'CSS Gradient Clip & Shift', desc: 'Clip gradient to text and animate translateX(-50%).', code: `.marquee-track { display: flex; overflow: hidden; background: linear-gradient(90deg, #FF4D2E, #10B981, #FF4D2E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n.marquee-track span { animation: shift 8s linear infinite; }\n@keyframes shift { to { transform: translateX(-50%); } }`, lang: 'css' }
      ]),
      created_at: '2026-07-20'
    },
    {
      id: 'e7', slug: 'ripple-button', name: 'Ripple Button', category: 'hover', categoryLabel: 'Hover',
      description: 'A click ripple that radiates from the point of impact across a glassy button.',
      image: '',
      tags: ['button', 'ripple', 'click', 'css'], difficulty: 'easy', license: 'MIT',
      likes: 2750, saves: 980, views: 44000, author_id: 'c4', author_name: 'Dimitri Okafor', author_handle: '@dimi',
      author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<button class="ripple-button">Click For Ripple</button>`,
      css_code: `.ripple-button {
  position: relative;
  overflow: hidden;
  padding: 14px 28px;
  background: #0F1115;
  color: #FAF6EE;
  border: 1px solid rgba(255, 77, 46, 0.3);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.ripple-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 77, 46, 0.4);
  transform: scale(0);
  animation: ripple-wave 0.6s linear;
  pointer-events: none;
}
@keyframes ripple-wave {
  to { transform: scale(4); opacity: 0; }
}`,
      js_code: `const btn = document.querySelector('.ripple-button');
if (btn) {
  btn.addEventListener('click', function(e) {
    const r = this.getBoundingClientRect();
    const circle = document.createElement('span');
    const d = Math.max(r.width, r.height);
    circle.style.width = circle.style.height = \`\${d}px\`;
    circle.style.left = \`\${e.clientX - r.left - d/2}px\`;
    circle.style.top = \`\${e.clientY - r.top - d/2}px\`;
    circle.classList.add('ripple-circle');
    this.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}`,
      instructions: 'Listen for click coordinates, dynamically append an animated expanding circle, and remove after 600ms.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Button', desc: 'Create button with position: relative and overflow: hidden.', code: `<button class="ripple-button">Click For Ripple</button>`, lang: 'html' },
        { step: 2, title: 'CSS Wave Keyframe', desc: 'Scale circle from 0 to 4 with fade out opacity.', code: `.ripple-circle { position: absolute; border-radius: 50%; background: rgba(255, 77, 46, 0.4); transform: scale(0); animation: ripple-wave 0.6s linear; }\n@keyframes ripple-wave { to { transform: scale(4); opacity: 0; } }`, lang: 'css' },
        { step: 3, title: 'JS Click Origin Calculation', desc: 'Append ripple circle positioned exactly at cursor coordinates.', code: `btn.addEventListener('click', function(e) {\n  const r = this.getBoundingClientRect();\n  const c = document.createElement('span');\n  c.className = 'ripple-circle';\n  c.style.left = \`\${e.clientX - r.left}px\`;\n  this.appendChild(c);\n  setTimeout(() => c.remove(), 600);\n});`, lang: 'js' }
      ]),
      created_at: '2026-08-18'
    },
    {
      id: 'e8', slug: 'spotlight-card', name: 'Spotlight Card', category: 'card', categoryLabel: 'Cards',
      description: 'A card whose inner glow follows the mouse, illuminating a radial highlight across the surface.',
      image: '',
      tags: ['card', 'spotlight', 'glow', 'cursor'], difficulty: 'medium', license: 'MIT',
      likes: 6230, saves: 2410, views: 104000, author_id: 'c5', author_name: 'Noor Haddad', author_handle: '@noor',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="spotlight-card-demo">
  <div class="card-chip">PRO FEATURE</div>
  <h3>Spotlight Glowing Card</h3>
  <p>Move around this card to see the glowing rim light follow your cursor.</p>
</div>`,
      css_code: `.spotlight-card-demo {
  position: relative;
  padding: 28px;
  border-radius: 14px;
  background: #141210;
  border: 1px solid rgba(255, 77, 46, 0.2);
  color: #FAF6EE;
  overflow: hidden;
  --x: 50%;
  --y: 50%;
}
.spotlight-card-demo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle 160px at var(--x) var(--y), rgba(255, 77, 46, 0.18), transparent 80%);
  pointer-events: none;
}
.card-chip {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #FF4D2E;
  margin-bottom: 8px;
}
.spotlight-card-demo h3 { font-size: 16px; margin-bottom: 6px; }
.spotlight-card-demo p { font-size: 12px; color: #a9967f; }`,
      js_code: `const card = document.querySelector('.spotlight-card-demo');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', \`\${e.clientX - r.left}px\`);
    card.style.setProperty('--y', \`\${e.clientY - r.top}px\`);
  });
}`,
      instructions: 'Smooth card highlighting with radial gradient tracking mouse position on the card surface.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Card Structure', desc: 'Create card content and tags.', code: `<div class="spotlight-card-demo"><h3>Spotlight Card</h3><p>Move mouse</p></div>`, lang: 'html' },
        { step: 2, title: 'CSS Glow Overlay', desc: 'Style radial gradient overlay on ::before.', code: `.spotlight-card-demo::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle 160px at var(--x) var(--y), rgba(255,77,46,0.2), transparent); }`, lang: 'css' },
        { step: 3, title: 'JS Mousemove Listener', desc: 'Update CSS variables on mouse movement.', code: `card.addEventListener('mousemove', (e) => {\n  const r = card.getBoundingClientRect();\n  card.style.setProperty('--x', \`\${e.clientX - r.left}px\`);\n  card.style.setProperty('--y', \`\${e.clientY - r.top}px\`);\n});`, lang: 'js' }
      ]),
      created_at: '2026-07-31'
    },
    {
      id: 'e9', slug: 'blob-morph', name: 'Blob Morph', category: 'misc', categoryLabel: 'Creative',
      description: 'A liquid blob that continuously morphs between organic shapes — perfect as a soft animated backdrop.',
      image: '',
      tags: ['blob', 'morph', 'organic', 'css'], difficulty: 'medium', license: 'MIT',
      likes: 3520, saves: 1330, views: 61000, author_id: 'c6', author_name: 'Theo Marchand', author_handle: '@theo',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="blob-stage">
  <div class="blob-item"></div>
</div>`,
      css_code: `.blob-stage {
  display: flex;
  align-items: center;
  justify-content: center;
}
.blob-item {
  width: 110px;
  height: 110px;
  background: linear-gradient(135deg, #FF4D2E, #10B981);
  filter: blur(2px);
  animation: fxMorph 7s ease-in-out infinite;
}
@keyframes fxMorph {
  0%, 100% { border-radius: 62% 38% 54% 46% / 55% 48% 52% 45%; transform: rotate(0deg) scale(1); }
  33% { border-radius: 35% 65% 58% 42% / 63% 38% 62% 37%; transform: rotate(60deg) scale(1.08); }
  66% { border-radius: 70% 30% 42% 58% / 40% 60% 40% 60%; transform: rotate(120deg) scale(0.96); }
}`,
      js_code: '',
      instructions: 'Organic liquid morphing accomplished entirely through 8-value CSS border-radius keyframes and subtle rotation.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Stage', desc: 'Create container with morphing blob element.', code: `<div class="blob-stage"><div class="blob-item"></div></div>`, lang: 'html' },
        { step: 2, title: 'CSS 8-Value Border Radius', desc: 'Animate non-uniform border radius on 0%, 33%, 66%, and 100%.', code: `@keyframes fxMorph {\n  0%, 100% { border-radius: 62% 38% 54% 46% / 55% 48% 52% 45%; transform: rotate(0deg); }\n  33% { border-radius: 35% 65% 58% 42% / 63% 38% 62% 37%; transform: rotate(60deg); }\n}`, lang: 'css' }
      ]),
      created_at: '2026-08-08'
    },
    {
      id: 'e10', slug: 'page-reveal-transition', name: 'Page Reveal Transition', category: 'transition', categoryLabel: 'Transitions',
      description: 'A curtain reveal that wipes between pages using clip-path — buttery and native-feeling.',
      image: '',
      tags: ['transition', 'clip-path', 'page', 'reveal'], difficulty: 'advanced', license: 'MIT',
      likes: 4510, saves: 1780, views: 83000, author_id: 'c6', author_name: 'Theo Marchand', author_handle: '@theo',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="reveal-curtain-box">
  <div class="reveal-layer">HOVER TO REVEAL</div>
</div>`,
      css_code: `.reveal-curtain-box {
  position: relative;
  width: 220px;
  height: 90px;
  background: #141210;
  border-radius: 8px;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}
.reveal-layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #FF4D2E, #10B981);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  clip-path: inset(0 0 0 0);
  transition: clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-curtain-box:hover .reveal-layer {
  clip-path: inset(0 0 100% 0);
}`,
      js_code: '',
      instructions: 'Smooth curtain wipe transition utilizing CSS clip-path inset() with customized bezier curves.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Reveal Layers', desc: 'Create base and overlay layers.', code: `<div class="reveal-curtain-box"><div class="reveal-layer">HOVER TO REVEAL</div></div>`, lang: 'html' },
        { step: 2, title: 'CSS Clip Path Transition', desc: 'Animate clip-path from inset(0 0 0 0) to inset(0 0 100% 0).', code: `.reveal-layer { clip-path: inset(0 0 0 0); transition: clip-path 0.6s cubic-bezier(0.16,1,0.3,1); }\n.reveal-curtain-box:hover .reveal-layer { clip-path: inset(0 0 100% 0); }`, lang: 'css' }
      ]),
      created_at: '2026-07-25'
    },
    {
      id: 'e11', slug: 'glass-stack-cards', name: 'Glass Stack', category: 'card', categoryLabel: 'Cards',
      description: 'Stacked frosted-glass panels that fan out and lift on hover, giving depth without clutter.',
      image: '',
      tags: ['card', 'glass', 'stack', 'depth'], difficulty: 'medium', license: 'MIT',
      likes: 2980, saves: 1140, views: 49000, author_id: 'c2', author_name: 'Kenji Sato', author_handle: '@kenji',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="glass-stack-demo">
  <div class="glass-card">Layer 01</div>
  <div class="glass-card">Layer 02</div>
  <div class="glass-card">Layer 03</div>
</div>`,
      css_code: `.glass-stack-demo {
  position: relative;
  width: 160px;
  height: 90px;
  cursor: pointer;
}
.glass-card {
  position: absolute;
  inset: 0;
  padding: 12px;
  border-radius: 8px;
  background: rgba(20, 18, 15, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FAF6EE;
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card:nth-child(1) { transform: translate(0, 0); z-index: 3; }
.glass-card:nth-child(2) { transform: translate(8px, 8px); z-index: 2; opacity: 0.8; }
.glass-card:nth-child(3) { transform: translate(16px, 16px); z-index: 1; opacity: 0.6; }
.glass-stack-demo:hover .glass-card:nth-child(2) { transform: translate(24px, 12px); }
.glass-stack-demo:hover .glass-card:nth-child(3) { transform: translate(48px, 24px); }`,
      js_code: '',
      instructions: 'Layered cards with frosted backdrop-filter that fan out laterally on parent container hover.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Stack Elements', desc: 'Create three sibling card divs.', code: `<div class="glass-stack-demo">\n  <div class="glass-card">Layer 01</div>\n  <div class="glass-card">Layer 02</div>\n  <div class="glass-card">Layer 03</div>\n</div>`, lang: 'html' },
        { step: 2, title: 'CSS Backdrop Filter & Fan-out', desc: 'Apply backdrop-filter: blur and translate offsets on nth-child.', code: `.glass-card { backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.12); transition: transform .35s; }\n.glass-stack-demo:hover .glass-card:nth-child(2) { transform: translate(24px, 12px); }`, lang: 'css' }
      ]),
      created_at: '2026-08-12'
    },
    {
      id: 'e12', slug: 'text-gradient-shimmer', name: 'Shimmer Text', category: 'text', categoryLabel: 'Text',
      description: 'A metallic sheen sweeps across gradient text, catching the eye on logos and headers.',
      image: '',
      tags: ['text', 'shimmer', 'gradient', 'logo'], difficulty: 'easy', license: 'MIT',
      likes: 3890, saves: 1420, views: 67000, author_id: 'c3', author_name: 'Ava Laurent', author_handle: '@ava',
      author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<span class="fx-shimmer-title">CODESPARK</span>`,
      css_code: `.fx-shimmer-title {
  font-family: 'Bebas Neue', sans-serif;
  font-weight: 700;
  font-size: 2.8rem;
  letter-spacing: 0.1em;
  background: linear-gradient(90deg, #948a79 0%, #FAF6EE 50%, #948a79 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shine-sweep 2.4s linear infinite;
}
@keyframes shine-sweep {
  to { background-position: -200% center; }
}`,
      js_code: '',
      instructions: 'Background-size: 200% on a linear-gradient text clip animated continuously across the X axis.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Text Header', desc: 'Create the span element for shimmer text.', code: `<span class="fx-shimmer-title">CODESPARK</span>`, lang: 'html' },
        { step: 2, title: 'CSS Background Clip & Sweep', desc: 'Set background-size 200% and animate background-position.', code: `.fx-shimmer-title { background: linear-gradient(90deg, #948a79, #FAF6EE, #948a79); background-size: 200% auto; -webkit-background-clip: text; color: transparent; animation: shine 2.4s linear infinite; }\n@keyframes shine { to { background-position: -200% center; } }`, lang: 'css' }
      ]),
      created_at: '2026-07-16'
    },
    {
      id: 'e13', slug: 'custom-cursor-follower', name: 'Cursor Follower', category: 'cursor', categoryLabel: 'Cursor',
      description: 'A smooth trailing dot that chases your cursor with spring physics, leaving a soft glow in its wake.',
      image: '',
      tags: ['cursor', 'follower', 'spring', 'glow'], difficulty: 'medium', license: 'MIT',
      likes: 5870, saves: 2260, views: 112000, author_id: 'c1', author_name: 'Mara Voss', author_handle: '@mara',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="follower-stage">
  <div class="spring-dot"></div>
  <span class="guide-text">MOVE MOUSE INSIDE</span>
</div>`,
      css_code: `.follower-stage {
  position: relative;
  width: 100%;
  height: 120px;
  background: #141210;
  border-radius: 8px;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.guide-text { font-size: 11px; font-family: monospace; color: #7e6c60; letter-spacing: 0.15em; }
.spring-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #FF4D2E;
  box-shadow: 0 0 16px #FF4D2E;
  pointer-events: none;
  transition: transform 0.12s ease-out;
}`,
      js_code: `const stage = document.querySelector('.follower-stage');
const dot = document.querySelector('.spring-dot');
if (stage && dot) {
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left - 7;
    const y = e.clientY - r.top - 7;
    dot.style.transform = \`translate(\${x}px, \${y}px)\`;
  });
}`,
      instructions: 'Smooth pointer tracking dot with easing transition and glowing box-shadow.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Dot Stage', desc: 'Create the follower dot element inside the stage.', code: `<div class="follower-stage"><div class="spring-dot"></div></div>`, lang: 'html' },
        { step: 2, title: 'CSS Glow & Eased Transition', desc: 'Apply box-shadow and transform transition.', code: `.spring-dot { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #FF4D2E; box-shadow: 0 0 16px #FF4D2E; transition: transform .12s ease-out; }`, lang: 'css' },
        { step: 3, title: 'JS Mouse Tracking', desc: 'Translate follower dot to pointer offset.', code: `stage.addEventListener('mousemove', (e) => {\n  const r = stage.getBoundingClientRect();\n  dot.style.transform = \`translate(\${e.clientX - r.left - 7}px, \${e.clientY - r.top - 7}px)\`;\n});`, lang: 'js' }
      ]),
      created_at: '2026-07-22'
    },
    {
      id: 'e14', slug: 'skeleton-loading', name: 'Skeleton Pulse', category: 'loader', categoryLabel: 'Loaders',
      description: 'A shimmering skeleton that fills a card layout, giving structure while real content loads.',
      image: '',
      tags: ['loader', 'skeleton', 'shimmer', 'state'], difficulty: 'easy', license: 'MIT',
      likes: 2210, saves: 860, views: 38000, author_id: 'c4', author_name: 'Dimitri Okafor', author_handle: '@dimi',
      author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="skel-card">
  <div class="skel-bar skel-title"></div>
  <div class="skel-bar skel-body"></div>
  <div class="skel-bar skel-body-short"></div>
</div>`,
      css_code: `.skel-card {
  width: 200px;
  padding: 16px;
  border-radius: 8px;
  background: #141210;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skel-bar {
  border-radius: 4px;
  background: linear-gradient(90deg, #2A221C 0%, #47392B 50%, #2A221C 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.6s linear infinite;
}
.skel-title { height: 14px; width: 60%; }
.skel-body { height: 10px; width: 100%; }
.skel-body-short { height: 10px; width: 80%; }
@keyframes skel-shimmer {
  to { background-position: -200% 0; }
}`,
      js_code: '',
      instructions: 'Skeleton UI placeholder featuring a moving linear-gradient background sweep.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Skeleton Elements', desc: 'Create skeleton placeholder bars.', code: `<div class="skel-card"><div class="skel-bar skel-title"></div><div class="skel-bar skel-body"></div></div>`, lang: 'html' },
        { step: 2, title: 'CSS Linear Shimmer Animation', desc: 'Animate background-position on the gradient bars.', code: `.skel-bar { background: linear-gradient(90deg, #2A221C, #47392B, #2A221C); background-size: 200% 100%; animation: skel-shimmer 1.6s linear infinite; }\n@keyframes skel-shimmer { to { background-position: -200% 0; } }`, lang: 'css' }
      ]),
      created_at: '2026-08-20'
    },
    {
      id: 'e15', slug: 'parallax-tilt-scene', name: 'Parallax Tilt Scene', category: '3d', categoryLabel: '3D / Tilt',
      description: 'Multiple layers translate at different speeds as you tilt — a real sense of depth in a single element.',
      image: '',
      tags: ['3d', 'parallax', 'depth', 'layers'], difficulty: 'advanced', license: 'BSD-2',
      likes: 6920, saves: 2750, views: 139000, author_id: 'c2', author_name: 'Kenji Sato', author_handle: '@kenji',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<div class="parallax-scene-box">
  <div class="layer-bg">BACKGROUND</div>
  <div class="layer-fg">FOREGROUND</div>
</div>`,
      css_code: `.parallax-scene-box {
  position: relative;
  width: 220px;
  height: 100px;
  perspective: 600px;
  background: #141210;
  border-radius: 10px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 77, 46, 0.2);
  cursor: pointer;
}
.layer-bg, .layer-fg {
  position: absolute;
  font-family: monospace;
  font-weight: 700;
  transition: transform 0.25s ease-out;
}
.layer-bg { color: #47392B; font-size: 14px; }
.layer-fg { color: #FF4D2E; font-size: 16px; text-shadow: 0 4px 12px rgba(0,0,0,0.8); }`,
      js_code: `const scene = document.querySelector('.parallax-scene-box');
const bg = document.querySelector('.layer-bg');
const fg = document.querySelector('.layer-fg');
if (scene && bg && fg) {
  scene.addEventListener('mousemove', (e) => {
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2);
    const y = (e.clientY - r.top - r.height / 2);
    bg.style.transform = \`translate(\${x * 0.1}px, \${y * 0.1}px)\`;
    fg.style.transform = \`translate(\${x * 0.35}px, \${y * 0.35}px)\`;
  });
  scene.addEventListener('mouseleave', () => {
    bg.style.transform = 'translate(0,0)';
    fg.style.transform = 'translate(0,0)';
  });
}`,
      instructions: 'Multi-layer translation offsets where foreground shifts at 3.5x the magnitude of the background layer.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Multi-Layer Stack', desc: 'Create background and foreground sibling elements.', code: `<div class="parallax-scene-box"><div class="layer-bg">BG</div><div class="layer-fg">FG</div></div>`, lang: 'html' },
        { step: 2, title: 'CSS Position & Easing', desc: 'Style relative container with absolute positioned layers.', code: `.layer-bg, .layer-fg { position: absolute; transition: transform 0.25s ease-out; }`, lang: 'css' },
        { step: 3, title: 'JS Differential Translation', desc: 'Apply different multipliers (0.1 vs 0.35) to create illusion of physical depth.', code: `scene.addEventListener('mousemove', (e) => {\n  const x = e.clientX - r.left - r.width/2;\n  bg.style.transform = \`translate(\${x * 0.1}px, ...)\`;\n  fg.style.transform = \`translate(\${x * 0.35}px, ...)\`;\n});`, lang: 'js' }
      ]),
      created_at: '2026-07-18'
    },
    {
      id: 'e16', slug: 'magnetic-nav-link', name: 'Magnetic Nav Links', category: 'hover', categoryLabel: 'Hover',
      description: 'Navigation links that breathe toward the cursor — a premium feel for header menus.',
      image: '',
      tags: ['magnetic', 'nav', 'menu', 'hover'], difficulty: 'easy', license: 'MIT',
      likes: 1980, saves: 720, views: 33000, author_id: 'c1', author_name: 'Mara Voss', author_handle: '@mara',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      html_code: `<nav class="mag-nav">
  <a href="#demo" class="mag-link">Components</a>
  <a href="#demo" class="mag-link">Showcase</a>
</nav>`,
      css_code: `.mag-nav { display: flex; gap: 8px; }
.mag-link {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  color: #FAF6EE;
  background: #1d1a16;
  border: 1px solid rgba(255, 77, 46, 0.2);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s;
}
.mag-link:hover { background: #FF4D2E; color: #fff; }`,
      js_code: `document.querySelectorAll('.mag-link').forEach(link => {
  link.addEventListener('mousemove', (e) => {
    const r = link.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * 0.4;
    const y = (e.clientY - r.top - r.height/2) * 0.4;
    link.style.transform = \`translate(\${x}px, \${y}px)\`;
  });
  link.addEventListener('mouseleave', () => {
    link.style.transform = 'translate(0, 0)';
  });
});`,
      instructions: 'Lightweight magnetic pull attached to pill navigation links.',
      steps: JSON.stringify([
        { step: 1, title: 'HTML Navigation Links', desc: 'Create pill nav links with mag-link class.', code: `<nav class="mag-nav"><a href="#" class="mag-link">Components</a></nav>`, lang: 'html' },
        { step: 2, title: 'CSS Pill Style', desc: 'Rounded pill shape with smooth transform transition.', code: `.mag-link { display: inline-block; border-radius: 999px; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }`, lang: 'css' },
        { step: 3, title: 'JS Event Binding', desc: 'Iterate over all links with forEach to attach independent magnetic translation.', code: `document.querySelectorAll('.mag-link').forEach(link => {\n  link.addEventListener('mousemove', (e) => { ... });\n});`, lang: 'js' }
      ]),
      created_at: '2026-08-14'
    }
  ];

  initialEffectsData.forEach((eff) => {
    insertEffect.run(
      eff.id, eff.slug, eff.name, eff.description, eff.image, eff.category,
      eff.categoryLabel, JSON.stringify(eff.tags), eff.difficulty, eff.license,
      eff.likes, eff.saves, eff.views, eff.author_id, eff.author_name,
      eff.author_handle, eff.author_avatar, eff.html_code, eff.css_code,
      eff.js_code, eff.instructions, eff.steps, 'published', eff.created_at
    );
  });

  console.log('✅ 16 Initial Effects successfully updated with step-by-step instructions in SQLite!');
}
