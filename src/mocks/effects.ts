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

export const creators: Creator[] = [
  { id: 'c1', name: 'Mara Voss', handle: '@mara', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', role: 'Creative Developer', followers: 12840, effects: 32, bio: 'Pushing pixels and easing curves since the jQuery days.', tags: ['hover', 'cursor', 'motion'] },
  { id: 'c2', name: 'Kenji Sato', handle: '@kenji', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', role: 'Frontend Engineer', followers: 9420, effects: 21, bio: 'I build tiny interactions that make big interfaces feel alive.', tags: ['3d', 'cards', 'motion'] },
  { id: 'c3', name: 'Ava Laurent', handle: '@ava', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', role: 'Motion Designer', followers: 18730, effects: 47, bio: 'Type is a playground. Most of my work lives between two keyframes.', tags: ['text', 'transition', 'creative'] },
  { id: 'c4', name: 'Dimitri Okafor', handle: '@dimi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', role: 'UI Engineer', followers: 6120, effects: 15, bio: 'Loaders, states and micro-moments. Performance obsessed.', tags: ['loader', 'hover', 'cards'] },
  { id: 'c5', name: 'Noor Haddad', handle: '@noor', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80', role: 'Design Engineer', followers: 22300, effects: 58, bio: 'Where design systems meet the canvas. I ship the in-between.', tags: ['cards', 'cursor', 'text'] },
  { id: 'c6', name: 'Theo Marchand', handle: '@theo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80', role: 'Creative Coder', followers: 7910, effects: 26, bio: 'Shaders by night, semantic HTML by day.', tags: ['creative', '3d', 'transition'] },
];

export const effects: Effect[] = [
  {
    id: 'e1', slug: 'magnetic-button', name: 'Magnetic Button', category: 'hover', categoryLabel: 'Hover',
    description: 'A CTA that is subtly pulled toward your cursor — the button leans in just before you commit.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['magnetic', 'button', 'cursor', 'micro-interaction'],
    difficulty: 'medium', license: 'MIT', likes: 4820, saves: 1730, views: 96000, author: creators[0], createdAt: '2026-08-01',
    interactions: ['hover', 'magnetic', 'spring'],
  },
  {
    id: 'e2', slug: '3d-tilt-card', name: '3D Tilt Card', category: '3d', categoryLabel: '3D / Tilt',
    description: 'A perspective card that rotates on the X and Y axes as you move, with a glare highlight that follows.',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    tags: ['3d', 'perspective', 'card', 'tilt'],
    difficulty: 'medium', license: 'MIT', likes: 9310, saves: 4020, views: 210000, author: creators[1], createdAt: '2026-07-28',
    interactions: ['hover', 'tilt', 'depth', 'glare'],
  },
  {
    id: 'e3', slug: 'text-scramble', name: 'Text Scramble', category: 'text', categoryLabel: 'Text',
    description: 'Characters violently scramble and settle into the final word. Perfect for hero headlines and reveals.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['text', 'scramble', 'animation', 'decoder'],
    difficulty: 'advanced', license: 'BSD-2', likes: 7640, saves: 2980, views: 150000, author: creators[2], createdAt: '2026-08-10',
    interactions: ['scroll', 'text', 'js'],
  },
  {
    id: 'e4', slug: 'cursor-spotlight', name: 'Cursor Spotlight', category: 'cursor', categoryLabel: 'Cursor',
    description: 'A radial spotlight that reveals the text beneath as your cursor glides across the section.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    tags: ['cursor', 'spotlight', 'text', 'reveal'],
    difficulty: 'easy', license: 'MIT', likes: 5280, saves: 1890, views: 88000, author: creators[4], createdAt: '2026-08-05',
    interactions: ['cursor', 'hover', 'spotlight'],
  },
  {
    id: 'e5', slug: 'aurora-loader', name: 'Aurora Loader', category: 'loader', categoryLabel: 'Loaders',
    description: 'Three flowing blobs orbit a core, blending into a calm aurora while your content loads.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    tags: ['loader', 'aurora', 'blur', 'css'],
    difficulty: 'easy', license: 'MIT', likes: 3140, saves: 1210, views: 52000, author: creators[3], createdAt: '2026-08-15',
    interactions: ['css', 'spin', 'blend'],
  },
  {
    id: 'e6', slug: 'gradient-marquee-text', name: 'Gradient Marquee', category: 'text', categoryLabel: 'Text',
    description: 'An infinite horizontal marquee with a shifting gradient fill — loud, confident, on-brand.',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    tags: ['text', 'marquee', 'gradient', 'css'],
    difficulty: 'easy', license: 'MIT', likes: 4060, saves: 1540, views: 71000, author: creators[2], createdAt: '2026-07-20',
    interactions: ['css', 'marquee', 'infinite'],
  },
  {
    id: 'e7', slug: 'ripple-button', name: 'Ripple Button', category: 'hover', categoryLabel: 'Hover',
    description: 'A click ripple that radiates from the point of impact across a glassy button.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    tags: ['button', 'ripple', 'click', 'css'],
    difficulty: 'easy', license: 'MIT', likes: 2750, saves: 980, views: 44000, author: creators[3], createdAt: '2026-08-18',
    interactions: ['click', 'ripple', 'button'],
  },
  {
    id: 'e8', slug: 'spotlight-card', name: 'Spotlight Card', category: 'card', categoryLabel: 'Cards',
    description: 'A card whose inner glow follows the mouse, illuminating a radial highlight across the surface.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    tags: ['card', 'spotlight', 'glow', 'cursor'],
    difficulty: 'medium', license: 'MIT', likes: 6230, saves: 2410, views: 104000, author: creators[4], createdAt: '2026-07-31',
    interactions: ['hover', 'glow', 'radial'],
  },
  {
    id: 'e9', slug: 'blob-morph', name: 'Blob Morph', category: 'misc', categoryLabel: 'Creative',
    description: 'A liquid blob that continuously morphs between organic shapes — perfect as a soft animated backdrop.',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80',
    tags: ['blob', 'morph', 'organic', 'css'],
    difficulty: 'medium', license: 'MIT', likes: 3520, saves: 1330, views: 61000, author: creators[5], createdAt: '2026-08-08',
    interactions: ['css', 'morph', 'infinite'],
  },
  {
    id: 'e10', slug: 'page-reveal-transition', name: 'Page Reveal Transition', category: 'transition', categoryLabel: 'Transitions',
    description: 'A curtain reveal that wipes between pages using clip-path — buttery and native-feeling.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    tags: ['transition', 'clip-path', 'page', 'reveal'],
    difficulty: 'advanced', license: 'MIT', likes: 4510, saves: 1780, views: 83000, author: creators[5], createdAt: '2026-07-25',
    interactions: ['click', 'clip-path', 'page'],
  },
  {
    id: 'e11', slug: 'glass-stack-cards', name: 'Glass Stack', category: 'card', categoryLabel: 'Cards',
    description: 'Stacked frosted-glass panels that fan out and lift on hover, giving depth without clutter.',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    tags: ['card', 'glass', 'stack', 'depth'],
    difficulty: 'medium', license: 'MIT', likes: 2980, saves: 1140, views: 49000, author: creators[1], createdAt: '2026-08-12',
    interactions: ['hover', 'glass', 'stack'],
  },
  {
    id: 'e12', slug: 'text-gradient-shimmer', name: 'Shimmer Text', category: 'text', categoryLabel: 'Text',
    description: 'A metallic sheen sweeps across gradient text, catching the eye on logos and headers.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    tags: ['text', 'shimmer', 'gradient', 'logo'],
    difficulty: 'easy', license: 'MIT', likes: 3890, saves: 1420, views: 67000, author: creators[2], createdAt: '2026-07-16',
    interactions: ['css', 'shimmer', 'infinite'],
  },
  {
    id: 'e13', slug: 'custom-cursor-follower', name: 'Cursor Follower', category: 'cursor', categoryLabel: 'Cursor',
    description: 'A smooth trailing dot that chases your cursor with spring physics, leaving a soft glow in its wake.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['cursor', 'follower', 'spring', 'glow'],
    difficulty: 'medium', license: 'MIT', likes: 5870, saves: 2260, views: 112000, author: creators[0], createdAt: '2026-07-22',
    interactions: ['cursor', 'spring', 'trail'],
  },
  {
    id: 'e14', slug: 'skeleton-loading', name: 'Skeleton Pulse', category: 'loader', categoryLabel: 'Loaders',
    description: 'A shimmering skeleton that fills a card layout, giving structure while real content loads.',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80',
    tags: ['loader', 'skeleton', 'shimmer', 'state'],
    difficulty: 'easy', license: 'MIT', likes: 2210, saves: 860, views: 38000, author: creators[3], createdAt: '2026-08-20',
    interactions: ['css', 'shimmer', 'placeholder'],
  },
  {
    id: 'e15', slug: 'parallax-tilt-scene', name: 'Parallax Tilt Scene', category: '3d', categoryLabel: '3D / Tilt',
    description: 'Multiple layers translate at different speeds as you tilt — a real sense of depth in a single element.',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    tags: ['3d', 'parallax', 'depth', 'layers'],
    difficulty: 'advanced', license: 'BSD-2', likes: 6920, saves: 2750, views: 139000, author: creators[1], createdAt: '2026-07-18',
    interactions: ['hover', 'parallax', 'depth'],
  },
  {
    id: 'e16', slug: 'magnetic-nav-link', name: 'Magnetic Nav Links', category: 'hover', categoryLabel: 'Hover',
    description: 'Navigation links that breathe toward the cursor — a premium feel for header menus.',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    tags: ['magnetic', 'nav', 'menu', 'hover'],
    difficulty: 'easy', license: 'MIT', likes: 1980, saves: 720, views: 33000, author: creators[0], createdAt: '2026-08-14',
    interactions: ['hover', 'magnetic', 'nav'],
  },
];

export const trendingEffects = effects.filter((e) => ['e2', 'e3', 'e8', 'e13', 'e15'].includes(e.id));
export const newEffects = effects.filter((e) => ['e14', 'e7', 'e11', 'e3', 'e5', 'e9'].includes(e.id));
export const featuredCreators = creators.filter((c) => ['c5', 'c3', 'c2', 'c1'].includes(c.id));