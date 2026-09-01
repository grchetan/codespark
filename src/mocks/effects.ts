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
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CodeSparkCore',
  role: 'Core Effect System',
  followers: 0,
  effects: 5,
  bio: 'Official interactive UI micro-interactions created by Chetan Prajapat & CodeSpark Core.',
  tags: ['official', 'verified', 'ui-motion', 'micro-interactions'],
  verified: true,
};

export const founderCreator: Creator = {
  id: 'u_chetan_founder',
  name: 'Chetan Prajapat',
  handle: '@chetan',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat',
  role: 'Founder & Lead Architect',
  followers: 0,
  effects: 5,
  bio: 'Building the next generation of copy-paste interactive UI motion components for developers.',
  tags: ['founder', 'verified', 'architect', 'design-engineer'],
  verified: true,
};

export const creators: Creator[] = [
  officialCreator,
  founderCreator
];

// Strictly the 5 verified database effects
export const effects: Effect[] = [
  {
    id: 'e1', slug: 'magnetic-button', name: 'Magnetic Button', category: 'hover', categoryLabel: 'Hover',
    description: 'A CTA that is subtly pulled toward your cursor — the button leans in just before you commit.',
    image: '',
    tags: ['magnetic', 'button', 'cursor', 'micro-interaction'],
    difficulty: 'medium', license: 'MIT', likes: 0, saves: 0, views: 0, author: officialCreator, createdAt: '2026-09-01',
    interactions: ['hover', 'magnetic', 'spring'], isOfficial: true
  },
  {
    id: 'e2', slug: '3d-tilt-card', name: '3D Tilt Card', category: '3d', categoryLabel: '3D / Tilt',
    description: 'A perspective card that rotates on the X and Y axes as you move, with a glare highlight that follows.',
    image: '',
    tags: ['3d', 'perspective', 'card', 'tilt'],
    difficulty: 'medium', license: 'MIT', likes: 0, saves: 0, views: 0, author: officialCreator, createdAt: '2026-09-01',
    interactions: ['hover', 'tilt', 'depth', 'glare'], isOfficial: true
  },
  {
    id: 'e3', slug: 'text-scramble', name: 'Text Scramble Decoder', category: 'text', categoryLabel: 'Text',
    description: 'Characters violently scramble and decode into the final word. Perfect for hero headlines.',
    image: '',
    tags: ['text', 'scramble', 'animation', 'decoder'],
    difficulty: 'advanced', license: 'MIT', likes: 0, saves: 0, views: 0, author: officialCreator, createdAt: '2026-09-01',
    interactions: ['scroll', 'text', 'js'], isOfficial: true
  },
  {
    id: 'e4', slug: 'cursor-spotlight', name: 'Cursor Spotlight Card', category: 'cursor', categoryLabel: 'Cursor',
    description: 'A radial spotlight that reveals the text beneath as your cursor glides across the section.',
    image: '',
    tags: ['cursor', 'spotlight', 'text', 'reveal'],
    difficulty: 'easy', license: 'MIT', likes: 0, saves: 0, views: 0, author: officialCreator, createdAt: '2026-09-01',
    interactions: ['cursor', 'hover', 'spotlight'], isOfficial: true
  },
  {
    id: 'e5', slug: 'aurora-loader', name: 'Aurora Ambient Loader', category: 'loader', categoryLabel: 'Loaders',
    description: 'Soft blurred color blobs that rotate in opposing directions — an organic, ambient loading state.',
    image: '',
    tags: ['loader', 'aurora', 'blur', 'ambient', 'css-only'],
    difficulty: 'easy', license: 'MIT', likes: 0, saves: 0, views: 0, author: officialCreator, createdAt: '2026-09-01',
    interactions: ['loader', 'ambient', 'gradient'], isOfficial: true
  },
];

export const featuredCreators: Creator[] = [founderCreator, officialCreator];
export const trendingEffects: Effect[] = effects;