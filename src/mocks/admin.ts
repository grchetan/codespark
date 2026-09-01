export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'banned' | 'pending';
  joined: string;
  effects: number;
  avatar: string;
  reports?: number;
}

export interface Submission {
  id: string;
  name: string;
  category: string;
  author: string;
  email?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  difficulty: string;
  tags: string[];
  description?: string;
  html_code?: string;
  css_code?: string;
  js_code?: string;
  instructions?: string;
  steps?: any[];
}

export interface OfficialEffect {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_label?: string;
  description?: string;
  difficulty?: string;
  status: 'published' | 'draft' | 'archived';
  code: string;
  html_code?: string;
  css_code?: string;
  js_code?: string;
  instructions?: string;
  steps?: any[];
  updatedAt: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'content' | 'bug' | 'design';
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'done';
  votes: number;
  requestedBy: string;
  requestedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  submitted_at: string;
  status: 'unread' | 'read' | 'resolved';
}

export const adminUsers: AdminUser[] = [
  { id: 'u_admin_codespark', name: 'Chetan Prajapat', email: 'admin@codespark.dev', role: 'admin', status: 'active', joined: '2026-03-08', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat' },
  { id: 'u_chetan', name: 'Chetan Prajapat', email: 'chetan@codespark.dev', role: 'admin', status: 'active', joined: '2026-03-08', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat' },
  { id: 'u_codespark', name: 'CodeSpark Official', email: 'core@codespark.dev', role: 'admin', status: 'active', joined: '2026-03-08', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CodeSparkCore' },
];

export const submissions: Submission[] = [
  { id: 's1', name: 'Glow Border Hover', category: 'Hover', author: 'Aarav Sharma', submittedAt: '2026-08-23', status: 'pending', difficulty: 'easy', tags: ['hover', 'border', 'glow'], html_code: '<button class="glow-border">Glow Border</button>', css_code: '.glow-border { padding: 14px 28px; border: 2px solid #FF4D2E; background: transparent; color: #FAF6EE; cursor: pointer; transition: all .3s; } .glow-border:hover { box-shadow: 0 0 20px #FF4D2E; }' },
  { id: 's2', name: 'Wave Text Reveal', category: 'Text', author: 'Priya Mehta', submittedAt: '2026-08-22', status: 'pending', difficulty: 'medium', tags: ['text', 'wave', 'reveal'], html_code: '<span class="wave-text">WAVE REVEAL</span>', css_code: '.wave-text { font-size: 2rem; font-weight: 800; color: #10B981; }' },
  { id: 's3', name: 'Neon Spinner Loader', category: 'Loaders', author: 'Vivaan Gupta', submittedAt: '2026-08-21', status: 'approved', difficulty: 'easy', tags: ['loader', 'neon', 'spin'], html_code: '<div class="neon-spin"></div>', css_code: '.neon-spin { width: 40px; height: 40px; border: 3px solid #3B82F6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }' },
  { id: 's4', name: 'Isometric Flip Card', category: '3D / Tilt', author: 'Kabir Singh', submittedAt: '2026-08-20', status: 'pending', difficulty: 'advanced', tags: ['3d', 'flip', 'card'], html_code: '<div class="iso-card">Flip Card</div>', css_code: '.iso-card { width: 140px; height: 90px; background: #1a1715; border: 1px solid #FF4D2E; color: #fff; padding: 16px; border-radius: 8px; }' },
  { id: 's5', name: 'Marquee Glitch', category: 'Text', author: 'Rohan Verma', submittedAt: '2026-08-19', status: 'rejected', difficulty: 'medium', tags: ['text', 'marquee', 'glitch'] },
  { id: 's6', name: 'Spotlight Button', category: 'Hover', author: 'Isha Kapoor', submittedAt: '2026-08-18', status: 'approved', difficulty: 'easy', tags: ['button', 'spotlight'] },
];

export const officialEffects: OfficialEffect[] = [
  { id: 'e1', name: 'Magnetic Button', slug: 'magnetic-button', category: 'Hover', status: 'published', updatedAt: '2026-08-20', code: `.magnetic-btn {\n  transition: transform .3s cubic-bezier(.2,.8,.3,1);\n}\n.magnetic-btn:hover {\n  transform: translate(var(--dx), var(--dy));\n}` },
  { id: 'e2', name: '3D Tilt Card', slug: '3d-tilt-card', category: '3D / Tilt', status: 'published', updatedAt: '2026-08-18', code: `.tilt-card {\n  transform: rotateX(var(--rx)) rotateY(var(--ry));\n  transition: transform .15s ease-out;\n}` },
  { id: 'e3', name: 'Text Scramble', slug: 'text-scramble', category: 'Text', status: 'published', updatedAt: '2026-08-15', code: `// scramble text animation\nfunction scramble(el) {\n  const chars = "!<>-_\\\\/[]—=+*^?#";\n  // ...\n}` },
  { id: 'e4', name: 'Aurora Loader', slug: 'aurora-loader', category: 'Loaders', status: 'draft', updatedAt: '2026-08-24', code: `.aurora {\n  filter: blur(40px);\n  mix-blend-mode: screen;\n}` },
  { id: 'e5', name: 'Cursor Spotlight', slug: 'cursor-spotlight', category: 'Cursor', status: 'published', updatedAt: '2026-08-10', code: `.spotlight {\n  background: radial-gradient(200px at var(--mx) var(--my), rgba(255,255,255,.9), transparent);\n}` },
  { id: 'e6', name: 'Glass Stack Cards', slug: 'glass-stack-cards', category: 'Cards', status: 'archived', updatedAt: '2026-07-30', code: `.glass {\n  backdrop-filter: blur(14px);\n  background: rgba(255,255,255,.08);\n}` },
];

export const requirements: Requirement[] = [
  { id: 'r1', title: 'Dark mode toggle', description: 'Allow users to switch between light and dark theme across the whole library.', type: 'feature', priority: 'high', status: 'open', votes: 128, requestedBy: 'Kabir Singh', requestedAt: '2026-08-05' },
  { id: 'r2', title: 'Copy-to-clipboard on hover', description: 'One-click copy for all code snippets with a toast confirmation.', type: 'feature', priority: 'high', status: 'in-progress', votes: 96, requestedBy: 'Priya Mehta', requestedAt: '2026-08-09' },
  { id: 'r3', title: 'Fix marquee overflow on mobile', description: 'Gradient marquee overflows the viewport width on small screens.', type: 'bug', priority: 'medium', status: 'done', votes: 41, requestedBy: 'Vivaan Gupta', requestedAt: '2026-08-14' },
  { id: 'r4', title: 'Add keyboard shortcut /', description: 'Press / to focus the search bar anywhere on the site.', type: 'feature', priority: 'low', status: 'done', votes: 33, requestedBy: 'Isha Kapoor', requestedAt: '2026-07-22' },
  { id: 'r5', title: 'Creator profile pages', description: 'Public profile pages for each creator showing their published effects.', type: 'content', priority: 'medium', status: 'open', votes: 77, requestedBy: 'Meera Nair', requestedAt: '2026-08-16' },
  { id: 'r6', title: 'Direct Live Preview cards without images', description: 'Render interactive live sandboxes directly in catalog cards.', type: 'feature', priority: 'high', status: 'done', votes: 89, requestedBy: 'Chetan Prajapat', requestedAt: '2026-08-27' },
];

export const adminStats = {
  totalEffects: 18,
  totalUsers: 8,
  pendingReviews: 2,
  activeSubmissions: 6,
  bannedUsers: 1,
  unreadMessages: 0,
  monthlyViews: 520000,
};

export const recentActivity = [
  { id: 'a1', action: 'approved', target: 'Cyberpunk Glitch Neon', by: 'Chetan Prajapat', time: 'Just now' },
  { id: 'a2', action: 'published', target: 'Direct Live Preview Engine', by: 'Chetan Prajapat', time: '1 hour ago' },
  { id: 'a3', action: 'approved', target: 'Neon Border Glow', by: 'Chetan Prajapat', time: '2 hours ago' },
  { id: 'a4', action: 'submitted', target: 'Glow Border Hover', by: 'Aarav Sharma', time: '4 hours ago' },
  { id: 'a5', action: 'banned', target: 'Rohan Verma', by: 'Chetan Prajapat', time: '1 day ago' },
];