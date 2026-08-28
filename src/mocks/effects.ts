export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  followers: number;
  effects: number;
  bio: string;
  tags: string[];
  verified?: boolean;
}

export interface EffectStep {
  step: number;
  title: string;
  desc: string;
  code: string;
  lang: 'html' | 'css' | 'js' | 'bash';
}

export interface Effect {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
  license: string;
  likes: number;
  saves: number;
  views: number;
  author: Creator;
  html_code?: string;
  css_code?: string;
  js_code?: string;
  instructions?: string;
  steps?: EffectStep[];
  createdAt: string;
  interactions: string[];
  isOfficial?: boolean;
}

export const categories: { key: string; label: string; icon: string; blurb: string }[] = [
  { key: 'all', label: 'All Effects', icon: 'ri-apps-2-line', blurb: 'Everything in the library' },
  { key: 'hover', label: 'Hover', icon: 'ri-mouse-line', blurb: 'Magnetic, tilt, glows, reveals' },
  { key: 'text', label: 'Text', icon: 'ri-font-size', blurb: 'Scramble, gradient, marquee' },
  { key: 'cursor', label: 'Cursor', icon: 'ri-cursor-line', blurb: 'Spotlight, trails, followers' },
  { key: '3d', label: '3D / Tilt', icon: 'ri-box-3-line', blurb: 'Depth, perspective, parallax' },
  { key: 'loader', label: 'Loaders', icon: 'ri-loader-4-line', blurb: 'Spinners, bars, skeleton' },
  { key: 'card', label: 'Cards', icon: 'ri-layout-grid-line', blurb: 'Spotlight cards, glass, stacks' },
  { key: 'transition', label: 'Transitions', icon: 'ri-swap-box-line', blurb: 'Page, reveal, clip transitions' },
  { key: 'misc', label: 'Creative', icon: 'ri-sparkling-2-line', blurb: 'Grain, blob, aurora, misc' },
];

export const officialCreator: Creator = {
  id: 'u_chetan',
  name: 'CodeSpark Official',
  handle: '@codespark',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  role: 'Core Effect System',
  followers: 48200,
  effects: 18,
  bio: 'Official interactive UI micro-interactions created by Chetan Prajapat & CodeSpark Core.',
  tags: ['official', 'verified', 'ui-motion', 'micro-interactions'],
  verified: true,
};

export const founderCreator: Creator = {
  id: 'u_chetan_founder',
  name: 'Chetan Prajapat',
  handle: '@chetan',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  role: 'Founder & Lead Architect',
  followers: 52000,
  effects: 18,
  bio: 'Building the next generation of copy-paste interactive UI motion components for developers.',
  tags: ['founder', 'verified', 'architect', 'design-engineer'],
  verified: true,
};

export const creators: Creator[] = [
  officialCreator,
  founderCreator
];

export const effects: Effect[] = [
  {
    id: 'e1', slug: 'magnetic-button', name: 'Magnetic Button', category: 'hover', categoryLabel: 'Hover',
    description: 'A CTA that is subtly pulled toward your cursor — the button leans in just before you commit.',
    image: '',
    tags: ['magnetic', 'button', 'cursor', 'micro-interaction'],
    difficulty: 'medium', license: 'MIT', likes: 4820, saves: 1730, views: 96000, author: officialCreator, createdAt: '2026-08-01',
    interactions: ['hover', 'magnetic', 'spring'], isOfficial: true
  },
  {
    id: 'e2', slug: '3d-tilt-card', name: '3D Tilt Card', category: '3d', categoryLabel: '3D / Tilt',
    description: 'A perspective card that rotates on the X and Y axes as you move, with a glare highlight that follows.',
    image: '',
    tags: ['3d', 'perspective', 'card', 'tilt'],
    difficulty: 'medium', license: 'MIT', likes: 9310, saves: 4020, views: 210000, author: officialCreator, createdAt: '2026-07-28',
    interactions: ['hover', 'tilt', 'depth', 'glare'], isOfficial: true
  },
  {
    id: 'e3', slug: 'text-scramble', name: 'Text Scramble', category: 'text', categoryLabel: 'Text',
    description: 'Characters violently scramble and settle into the final word. Perfect for hero headlines and reveals.',
    image: '',
    tags: ['text', 'scramble', 'animation', 'decoder'],
    difficulty: 'advanced', license: 'MIT', likes: 7640, saves: 2980, views: 150000, author: officialCreator, createdAt: '2026-08-10',
    interactions: ['scroll', 'text', 'js'], isOfficial: true
  },
  {
    id: 'e4', slug: 'cursor-spotlight', name: 'Cursor Spotlight', category: 'cursor', categoryLabel: 'Cursor',
    description: 'A radial spotlight that reveals the text beneath as your cursor glides across the section.',
    image: '',
    tags: ['cursor', 'spotlight', 'text', 'reveal'],
    difficulty: 'easy', license: 'MIT', likes: 5280, saves: 1890, views: 88000, author: officialCreator, createdAt: '2026-08-05',
    interactions: ['cursor', 'hover', 'spotlight'], isOfficial: true
  },
  {
    id: 'e5', slug: 'aurora-loader', name: 'Aurora Loader', category: 'loader', categoryLabel: 'Loaders',
    description: 'Soft blurred color blobs that rotate in opposing directions — an organic, ambient loading state.',
    image: '',
    tags: ['loader', 'aurora', 'blur', 'ambient', 'css-only'],
    difficulty: 'easy', license: 'MIT', likes: 6190, saves: 2430, views: 112000, author: officialCreator, createdAt: '2026-08-12',
    interactions: ['loader', 'ambient', 'gradient'], isOfficial: true
  },
  {
    id: 'e6', slug: 'gradient-marquee', name: 'Gradient Marquee', category: 'text', categoryLabel: 'Text',
    description: 'Dual-track marquee that scrolls infinitely in opposing directions with masked edge falloffs.',
    image: '',
    tags: ['marquee', 'text', 'ticker', 'infinite', 'css-only'],
    difficulty: 'easy', license: 'MIT', likes: 4120, saves: 1490, views: 74000, author: officialCreator, createdAt: '2026-07-22',
    interactions: ['scroll', 'infinite', 'text'], isOfficial: true
  },
  {
    id: 'e7', slug: 'ripple-button', name: 'Ripple Button', category: 'hover', categoryLabel: 'Hover',
    description: 'Material-inspired ripple wave expanding outward from the exact coordinate where you clicked.',
    image: '',
    tags: ['button', 'ripple', 'click', 'physics'],
    difficulty: 'easy', license: 'MIT', likes: 3880, saves: 1220, views: 61000, author: officialCreator, createdAt: '2026-07-15',
    interactions: ['click', 'ripple', 'hover'], isOfficial: true
  },
  {
    id: 'e8', slug: 'spotlight-card', name: 'Spotlight Card', category: 'card', categoryLabel: 'Cards',
    description: 'The border and inner glow illuminate dynamically toward the cursor position on hover.',
    image: '',
    tags: ['card', 'spotlight', 'border-glow', 'cursor'],
    difficulty: 'medium', license: 'MIT', likes: 8750, saves: 3640, views: 184000, author: officialCreator, createdAt: '2026-08-08',
    interactions: ['hover', 'spotlight', 'glow'], isOfficial: true
  },
  {
    id: 'e9', slug: 'blob-morph', name: 'Blob Morph', category: 'misc', categoryLabel: 'Creative',
    description: 'Organic SVG blob morphing smoothly between random border-radius keyframes in an infinite loop.',
    image: '',
    tags: ['blob', 'morph', 'organic', 'shape', 'css-only'],
    difficulty: 'medium', license: 'MIT', likes: 4530, saves: 1680, views: 79000, author: officialCreator, createdAt: '2026-08-03',
    interactions: ['infinite', 'morph', 'ambient'], isOfficial: true
  },
  {
    id: 'e10', slug: 'page-reveal-transition', name: 'Page Reveal Transition', category: 'transition', categoryLabel: 'Transitions',
    description: 'Curved clip-path wipe animation that smoothly expands across the viewport between route changes.',
    image: '',
    tags: ['transition', 'page', 'clip-path', 'reveal'],
    difficulty: 'advanced', license: 'MIT', likes: 6920, saves: 2810, views: 134000, author: officialCreator, createdAt: '2026-07-30',
    interactions: ['click', 'page', 'wipe'], isOfficial: true
  },
  {
    id: 'e11', slug: 'glass-stack', name: 'Glass Stack', category: 'card', categoryLabel: 'Cards',
    description: 'Layered frosted glass cards that fan out on hover with subtle backdrop-filter blur and refraction.',
    image: '',
    tags: ['glass', 'stack', 'frosted', 'fan-out', 'cards'],
    difficulty: 'medium', license: 'MIT', likes: 5840, saves: 2190, views: 104000, author: officialCreator, createdAt: '2026-08-07',
    interactions: ['hover', 'fan-out', 'glass'], isOfficial: true
  },
  {
    id: 'e12', slug: 'shimmer-text', name: 'Shimmer Text', category: 'text', categoryLabel: 'Text',
    description: 'A metallic beam of light continuously glides across the letterforms with high contrast.',
    image: '',
    tags: ['text', 'shimmer', 'metallic', 'gradient', 'css-only'],
    difficulty: 'easy', license: 'MIT', likes: 3670, saves: 1140, views: 57000, author: officialCreator, createdAt: '2026-07-18',
    interactions: ['infinite', 'gradient', 'text'], isOfficial: true
  },
  {
    id: 'e13', slug: 'cursor-follower', name: 'Cursor Follower', category: 'cursor', categoryLabel: 'Cursor',
    description: 'A smooth trailing dot with spring physics that expands when hovering over interactive elements.',
    image: '',
    tags: ['cursor', 'follower', 'spring', 'smooth', 'trailing'],
    difficulty: 'medium', license: 'MIT', likes: 7210, saves: 3050, views: 147000, author: officialCreator, createdAt: '2026-08-02',
    interactions: ['cursor', 'trailing', 'spring'], isOfficial: true
  },
  {
    id: 'e14', slug: 'skeleton-pulse', name: 'Skeleton Pulse', category: 'loader', categoryLabel: 'Loaders',
    description: 'Content placeholder with a diagonal shimmer sweep to indicate loading data seamlessly.',
    image: '',
    tags: ['skeleton', 'loader', 'placeholder', 'pulse', 'css-only'],
    difficulty: 'easy', license: 'MIT', likes: 3290, saves: 980, views: 49000, author: officialCreator, createdAt: '2026-07-12',
    interactions: ['loader', 'shimmer', 'pulse'], isOfficial: true
  },
  {
    id: 'e15', slug: 'parallax-tilt-scene', name: 'Parallax Tilt Scene', category: '3d', categoryLabel: '3D / Tilt',
    description: 'Multi-layer foreground and background floating elements moving at different depths on mousemove.',
    image: '',
    tags: ['parallax', '3d', 'scene', 'multi-layer', 'tilt'],
    difficulty: 'advanced', license: 'MIT', likes: 8430, saves: 3510, views: 176000, author: officialCreator, createdAt: '2026-08-09',
    interactions: ['hover', 'tilt', 'parallax', 'depth'], isOfficial: true
  },
  {
    id: 'e16', slug: 'magnetic-nav-links', name: 'Magnetic Nav Links', category: 'hover', categoryLabel: 'Hover',
    description: 'Navbar links that pull toward your cursor with a gliding pill indicator following beneath.',
    image: '',
    tags: ['nav', 'magnetic', 'pill', 'hover', 'menu'],
    difficulty: 'medium', license: 'MIT', likes: 5120, saves: 1980, views: 92000, author: officialCreator, createdAt: '2026-08-04',
    interactions: ['hover', 'magnetic', 'nav'], isOfficial: true
  },
];

export const featuredCreators: Creator[] = [founderCreator, officialCreator];
export const trendingEffects: Effect[] = effects.slice(0, 6);