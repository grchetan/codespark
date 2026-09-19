export interface ManualDocItem {
  id: string;
  slug: string;
  section: string;
  title: string;
  description: string;
  badge?: string;
  content: {
    heading?: string;
    paragraphs?: string[];
    codeSnippets?: { title: string; lang: 'html' | 'css' | 'js' | 'bash'; code: string }[];
    callouts?: { type: 'note' | 'tip' | 'warning'; text: string }[];
    subsections?: { title: string; text: string; code?: { lang: 'html' | 'css' | 'js' | 'bash'; code: string } }[];
  };
}

export const MANUAL_DOCS: ManualDocItem[] = [
  // 1. GETTING STARTED: Introduction
  {
    id: 'introduction',
    slug: 'introduction',
    section: 'Getting Started',
    title: 'Introduction',
    description: 'Understand what CodeSpark is and how to use its micro-interactions in your modern web projects.',
    badge: 'Core Guide',
    content: {
      heading: 'What is CodeSpark?',
      paragraphs: [
        'CodeSpark is a free and open-source collection of hand-crafted animations, interactive UI effects, and micro-interactions that you can seamlessly copy and paste directly into your projects.',
        'The micro-interactions are built using standard vanilla HTML, modern CSS keyframes, and optional vanilla JavaScript or React components, allowing complete freedom without framework lock-in.',
        'Whether you are building landing pages, design systems, portfolios, or SaaS dashboards, CodeSpark provides ready-to-use micro-interactions designed to elevate user engagement.'
      ],
      callouts: [
        {
          type: 'tip',
          text: 'Every component is built for performance with GPU-accelerated CSS properties (transform, opacity) and isolated execution.'
        }
      ],
      subsections: [
        {
          title: 'Design Philosophy',
          text: 'We believe UI micro-interactions should be lightweight, accessible, zero-dependency by default, and fully customizable to match your brand palette.'
        },
        {
          title: 'How to use these docs',
          text: 'Browse components in the left sidebar, test live micro-interactions in the interactive stage, copy the HTML/CSS/JS or React code, and drop it into your codebase.'
        }
      ]
    }
  },

  // 2. GETTING STARTED: Setup
  {
    id: 'setup',
    slug: 'setup',
    section: 'Getting Started',
    title: 'Setup & Installation',
    description: 'Learn how to integrate CodeSpark components into your vanilla or framework-based web project.',
    badge: 'Installation',
    content: {
      heading: 'Quick Integration Guide',
      paragraphs: [
        'CodeSpark effects require zero package installation for standard HTML/CSS/JS snippets. You can copy the code directly or install helper libraries when using React.'
      ],
      codeSnippets: [
        {
          title: 'Standard Web Integration (HTML/CSS)',
          lang: 'html',
          code: `<!-- 1. Include standard typography in your HTML <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

<!-- 2. Paste component HTML and linked CSS into your project -->
<button class="codespark-btn">Hover Me</button>`
        },
        {
          title: 'React / Next.js Setup',
          lang: 'bash',
          code: `# Optional icons or animation helpers (if needed)
npm install remixicon lucide-react`
        }
      ],
      callouts: [
        {
          type: 'note',
          text: 'Make sure your stylesheet includes standard box-sizing: border-box for pixel-perfect alignment.'
        }
      ],
      subsections: [
        {
          title: 'TailwindCSS Compatibility',
          text: 'All CodeSpark components can easily be translated into TailwindCSS utility classes or dropped into your global styles.css file.'
        }
      ]
    }
  },

  // 3. GETTING STARTED: Design System & Tokens
  {
    id: 'design-system',
    slug: 'design-system',
    section: 'Getting Started',
    title: 'Design System & Tokens',
    description: 'Learn how CodeSpark manages centralized CSS custom properties and high-contrast color tokens.',
    badge: 'Design Tokens',
    content: {
      heading: 'Centralized Design Token Architecture',
      paragraphs: [
        'CodeSpark features a robust token system built directly on CSS Custom Properties, making it effortless to customize palettes, switch between light/dark themes, and ensure accessible contrast without muddy colors.',
        'All colors map semantically to surfaces, typography, borders, and accents.'
      ],
      codeSnippets: [
        {
          title: 'CSS Custom Property Tokens (styles.css)',
          lang: 'css',
          code: `:root {
  /* Surfaces */
  --bg-primary: #0D0F12;
  --bg-secondary: #12151A;
  --bg-elevated: #171A20;

  /* Typography */
  --text-primary: #F5F1EA;
  --text-secondary: #C8C2B9;
  --text-muted: #918A80;

  /* Borders & Accents */
  --border: rgba(245, 241, 234, 0.14);
  --accent: #FF4B32;
  --accent-hover: #FF624B;
}`
        }
      ],
      callouts: [
        {
          type: 'tip',
          text: 'Using warm off-white (#F5F1EA) instead of harsh pure white (#FFFFFF) reduces eye fatigue while providing an exceptional 16.1:1 AAA contrast ratio.'
        }
      ],
      subsections: [
        {
          title: 'Typography System',
          text: 'CodeSpark combines Bebas Neue for powerful display headings, Playfair Display for editorial italic accents, Inter for interface elements, and JetBrains Mono for technical code blocks.'
        },
        {
          title: 'Accessibility Compliance',
          text: 'Every color combination meets or exceeds WCAG 2.1 AA (4.5:1 minimum contrast), ensuring complete legibility across high-resolution displays.'
        }
      ]
    }
  },

  // 4. GETTING STARTED: Architecture & Sandboxing
  {
    id: 'architecture',
    slug: 'architecture',
    section: 'Getting Started',
    title: 'Architecture & Sandboxing',
    description: 'Deep dive into CodeSpark dual-mode execution sandboxes, iframe isolation, and zero-eval React engine.',
    badge: 'Architecture',
    content: {
      heading: 'Security & Sandboxed Component Execution',
      paragraphs: [
        'Running dynamic, user-submitted frontend interactions requires rigorous isolation to prevent Cross-Site Scripting (XSS) and DOM contamination.',
        'CodeSpark implements a multi-barrier execution pipeline separating untrusted community code from trusted application logic.'
      ],
      callouts: [
        {
          type: 'note',
          text: 'The isolated iframe sandbox runs without allow-same-origin, ensuring zero access to parent cookies, localStorage, or JWT session tokens.'
        }
      ],
      subsections: [
        {
          title: '1. Sandboxed IFrame Engine (HTML/CSS/JS)',
          text: 'Community submissions are rendered inside an isolated <iframe> with sandbox="allow-scripts". Interaction overrides (custom text, colors, dark stage) are injected dynamically via templated CSS variables.'
        },
        {
          title: '2. Zero-Eval Compiled Registry (React)',
          text: 'Official React components are statically bundled at compile time without using eval() or new Function(). They execute with 0ms mount latency and complete TypeScript type safety.'
        }
      ]
    }
  },

  // 5. CORE ENGINEERING: WebGL & Shader Pipeline
  {
    id: 'webgl-shaders',
    slug: 'webgl-shaders',
    section: 'Core Engineering',
    title: 'WebGL & Shader Pipeline',
    description: 'How high-performance GPU animations like the Fluid Splash Cursor work with framebuffers and fragment shaders.',
    badge: 'WebGL',
    content: {
      heading: 'GPU-Accelerated WebGL Animations',
      paragraphs: [
        'For advanced micro-interactions like the Fluid Splash Cursor, DOM-based CSS animations are insufficient. CodeSpark leverages WebGL 2.0 / 1.0 directly on the GPU.',
        'The simulation solves Navier-Stokes fluid equations in real time across advection, divergence, pressure, and vorticity passes.'
      ],
      callouts: [
        {
          type: 'tip',
          text: 'Double-buffered Ping-Pong Framebuffer Objects (FBOs) allow instantaneous reading and writing of fluid velocity textures at 60+ FPS.'
        }
      ],
      subsections: [
        {
          title: 'Pointer Velocity Tracking',
          text: 'Cursor motion events compute differential vectors (dx, dy) to inject kinetic energy into the fluid grid on every animation frame.'
        },
        {
          title: 'Mobile GPU Compatibility',
          text: 'Floating-point linear filtering (HALF_FLOAT) automatically falls back to 8-bit integer textures when running on restricted mobile hardware.'
        }
      ]
    }
  },

  // 6. GETTING STARTED: Changelog
  {
    id: 'changelog',
    slug: 'changelog',
    section: 'Getting Started',
    title: 'Changelog',
    description: 'Recent release notes, component additions, and platform updates.',
    badge: 'v1.4.0',
    content: {
      heading: 'Release History',
      paragraphs: [
        'Track all improvements, new micro-interactions, database integrations, and developer documentation features.'
      ],
      subsections: [
        {
          title: 'v1.4.0 — Documentation Library & Independent Scroll Architecture',
          text: 'Rebuilt the effects detail experience with Mage-UI inspired independent 2-pane scrolling, dynamic category trees, manual documentation guides, and safe React component registries.'
        },
        {
          title: 'v1.3.0 — Supabase RBAC & Live Database Submissions',
          text: 'Integrated community effect submissions with instant admin verification and automatic publishing into the database.'
        },
        {
          title: 'v1.2.0 — Live Interactive Sandbox Stage',
          text: 'Added real-time device viewports (Desktop, Tablet, Mobile), dark/light stage toggles, and live text/color customizers.'
        }
      ]
    }
  },

  // 4. CONTRIBUTING: Overview
  {
    id: 'overview',
    slug: 'overview',
    section: 'Contributing',
    title: 'Contributing Overview',
    description: 'How to contribute your own creative UI micro-interactions to the CodeSpark community library.',
    badge: 'Community',
    content: {
      heading: 'Join the Creator Community',
      paragraphs: [
        'CodeSpark is driven by developers and UI motion designers worldwide. You can submit your own micro-interactions directly through the platform or open pull requests for core library features.',
        'Once submitted, your effect goes through admin verification to test performance and safety before appearing live in the documentation library with full attribution to your creator profile.'
      ],
      callouts: [
        {
          type: 'tip',
          text: 'Every approved effect displays your name, handle, and avatar in the creator credit section!'
        }
      ]
    }
  },

  // 5. CONTRIBUTING: Running Locally
  {
    id: 'running-locally',
    slug: 'running-locally',
    section: 'Contributing',
    title: 'Running Locally',
    description: 'Set up the CodeSpark development environment on your machine.',
    badge: 'Dev Guide',
    content: {
      heading: 'Local Development Setup',
      paragraphs: [
        'Follow these simple steps to run CodeSpark locally on your computer with Vite and React.'
      ],
      codeSnippets: [
        {
          title: 'Clone & Run Commands',
          lang: 'bash',
          code: `# 1. Clone repository
git clone https://github.com/chetanprajapat/codespark.git

# 2. Enter project directory
cd codespark

# 3. Install dependencies
npm install

# 4. Start Vite development server
npm run dev`
        }
      ],
      subsections: [
        {
          title: 'Environment Configuration',
          text: 'Create a .env file with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live authentication and community submissions.'
        }
      ]
    }
  },

  // 6. CONTRIBUTING: Adding Components
  {
    id: 'adding-components',
    slug: 'adding-components',
    section: 'Contributing',
    title: 'Adding Components',
    description: 'Step-by-step workflow for adding new effects either via submissions or manual React integration.',
    badge: 'Component Guide',
    content: {
      heading: 'Two Ways to Add Components',
      paragraphs: [
        'You can add new effects using two distinct methods based on whether they are vanilla HTML/CSS/JS or custom React components.'
      ],
      subsections: [
        {
          title: 'Method 1: Community Submission (HTML / CSS / JS)',
          text: 'Navigate to /submit, enter the effect title, select a category, paste your clean HTML, CSS, and optional JavaScript, and click Submit. Once approved in the Admin panel, it automatically appears in the documentation library.'
        },
        {
          title: 'Method 2: Manual React Component Registry',
          text: 'Create your trusted React component in src/effects/registry.tsx and register its component key in the EFFECT_REGISTRY map for seamless zero-eval execution.'
        }
      ]
    }
  },



  // 8. CONTRIBUTING: Guidelines
  {
    id: 'guidelines',
    slug: 'guidelines',
    section: 'Contributing',
    title: 'Guidelines',
    description: 'Quality standards and coding rules for interactive components.',
    badge: 'Standards',
    content: {
      heading: 'Quality & Code Standards',
      paragraphs: [
        'To ensure a high standard of developer experience across all effects in CodeSpark, all contributions must adhere to these core principles.'
      ],
      callouts: [
        {
          type: 'warning',
          text: 'Never use inline style attributes or hardcoded fixed dimensions that cause horizontal viewport overflow on mobile devices.'
        }
      ],
      subsections: [
        {
          title: 'CSS Class Naming',
          text: 'Prefix class names or use unique semantic naming (e.g. .cs-magnetic-btn, .loader-aurora) to prevent style collisions when users paste snippets into their projects.'
        },
        {
          title: 'Responsive Design',
          text: 'All effects must be tested on mobile (375px), tablet (768px), and desktop (1280px) viewports.'
        }
      ]
    }
  },

  // 9. CONTRIBUTING: Best Practices
  {
    id: 'best-practices',
    slug: 'best-practices',
    section: 'Contributing',
    title: 'Best Practices',
    description: 'Hardware acceleration, performance tips, and accessibility rules for web animations.',
    badge: 'Performance',
    content: {
      heading: 'Animation Performance & Accessibility',
      paragraphs: [
        'Smooth 60fps micro-interactions require adherence to web animation best practices.'
      ],
      codeSnippets: [
        {
          title: 'Accessibility: Reduced Motion Media Query',
          lang: 'css',
          code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`
        }
      ],
      subsections: [
        {
          title: 'Stick to Composite Properties',
          text: 'Animate transform and opacity whenever possible. Avoid animating width, height, top, left, or margin as they trigger heavy layout recalculations.'
        },
        {
          title: 'Hardware Acceleration',
          text: 'Use will-change: transform or transform: translateZ(0) judiciously for complex particle or 3D animations to leverage GPU compositing.'
        }
      ]
    }
  }
];

export const MANUAL_SECTIONS = [
  {
    title: 'Getting Started',
    items: MANUAL_DOCS.filter((d) => d.section === 'Getting Started')
  },
  {
    title: 'Core Engineering',
    items: MANUAL_DOCS.filter((d) => d.section === 'Core Engineering')
  },
  {
    title: 'Contributing',
    items: MANUAL_DOCS.filter((d) => d.section === 'Contributing')
  }
];
