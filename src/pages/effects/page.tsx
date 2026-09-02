import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import LivePreview from '@/components/feature/LivePreview';
import CodeBlock from '@/components/feature/CodeBlock';
import { formatCount } from '@/components/feature/EffectCard';
import { categories as defaultCategories, effects as defaultEffects, type Effect, type EffectStep } from '@/mocks/effects';
import { effectCode } from '@/mocks/code';
import { useSaved } from '@/context/SavedContext';
import { supabase } from '@/lib/supabase';
import { EFFECT_REGISTRY, REACT_CODE_SNIPPETS } from '@/effects/registry';
import { MANUAL_DOCS, MANUAL_SECTIONS, type ManualDocItem } from '@/data/manualDocs';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const COLOR_PRESETS = [
  { name: 'Flame Orange', hex: '#FF4D2E', bg: 'bg-[#FF4D2E]' },
  { name: 'Emerald Green', hex: '#10B981', bg: 'bg-[#10B981]' },
  { name: 'Cyber Blue', hex: '#3B82F6', bg: 'bg-[#3B82F6]' },
  { name: 'Electric Violet', hex: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
  { name: 'Amber Gold', hex: '#F59E0B', bg: 'bg-[#F59E0B]' },
  { name: 'Neon Pink', hex: '#EC4899', bg: 'bg-[#EC4899]' },
];

export default function EffectsWorkspace() {
  const { slug, docSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current active item mode
  const isDocRoute = location.pathname.includes('/effects/docs/') || (!slug && !docSlug && location.pathname === '/effects');
  const activeDocSlug = docSlug || (location.pathname === '/effects' ? 'introduction' : null);
  const activeEffectSlug = !isDocRoute ? slug : null;

  // Manual doc state
  const currentDoc: ManualDocItem | undefined = useMemo(() => {
    if (activeDocSlug) {
      return MANUAL_DOCS.find((d) => d.slug === activeDocSlug) || MANUAL_DOCS[0];
    }
    return undefined;
  }, [activeDocSlug]);

  // Database effects list for sidebar & component view
  const [allEffects, setAllEffects] = useState<Effect[]>(defaultEffects);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Effect detail state
  const [effect, setEffect] = useState<Effect | null>(null);
  const [code, setCode] = useState<{ html: string; css: string; js: string }>({ html: '', css: '', js: '' });
  const [steps, setSteps] = useState<EffectStep[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<string>('html');
  const [loading, setLoading] = useState(false);

  // Customizer interactive states
  const [customText, setCustomText] = useState('');
  const [customSubText, setCustomSubText] = useState('');
  const [customColor, setCustomColor] = useState('#FF4D2E');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [darkStage, setDarkStage] = useState(false);
  const [stageKey, setStageKey] = useState(0);

  // User saved & liked context
  const { isSaved, toggleSave, isLiked, toggleLike, getLikeCount } = useSaved();
  const [copied, setCopied] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [shared, setShared] = useState(false);

  const activeSidebarItemRef = useRef<HTMLAnchorElement | null>(null);
  const rightContentAreaRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch All Published Effects for Sidebar (from Supabase DB with mock fallback)
  useEffect(() => {
    const fetchAllEffects = async () => {
      try {
        const { data, error } = await supabase
          .from('effects')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Effect[] = data.map((e: any) => ({
            id: e.id,
            slug: e.slug || e.id,
            name: e.name,
            description: e.description || '',
            image: e.image || '',
            category: e.category,
            categoryLabel: e.category_label || e.category,
            tags: Array.isArray(e.tags) ? e.tags : (typeof e.tags === 'string' ? JSON.parse(e.tags) : []),
            difficulty: e.difficulty || 'medium',
            license: e.license || 'MIT',
            likes: e.likes || 0,
            saves: e.saves || 0,
            views: e.views || 0,
            author: {
              id: e.author_id || 'u_codespark',
              name: e.author_name || 'CodeSpark Official',
              handle: e.author_handle || '@codespark',
              avatar: e.author_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${e.name}`,
              role: 'Creator',
              followers: 0,
              effects: 1,
              bio: '',
              tags: ['verified'],
              verified: true,
            },
            html_code: e.html_code || '',
            css_code: e.css_code || '',
            js_code: e.js_code || '',
            instructions: e.instructions || '',
            steps: e.steps ? (typeof e.steps === 'string' ? JSON.parse(e.steps) : e.steps) : [],
            createdAt: (e.created_at || '2026-09-01').slice(0, 10),
            interactions: ['hover', 'click'],
            isOfficial: e.is_official ?? true,
          }));
          setAllEffects(mapped);
          return;
        }
      } catch {}

      // Fallback to local API or defaults
      fetch('/api/effects')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.effects) && data.effects.length > 0) {
            setAllEffects(data.effects);
          }
        })
        .catch(() => {});
    };

    fetchAllEffects();
  }, []);

  // 2. Fetch Selected Database Effect Details when slug changes
  useEffect(() => {
    if (!activeEffectSlug) {
      setEffect(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('effects')
          .select('*')
          .or(`slug.eq.${activeEffectSlug},id.eq.${activeEffectSlug}`)
          .single();

        if (!error && data) {
          const eff: Effect = {
            id: data.id,
            slug: data.slug || data.id,
            name: data.name,
            description: data.description || '',
            image: data.image || '',
            category: data.category,
            categoryLabel: data.category_label || data.category,
            tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? JSON.parse(data.tags) : []),
            difficulty: data.difficulty || 'medium',
            license: data.license || 'MIT',
            likes: data.likes || 0,
            saves: data.saves || 0,
            views: data.views || 0,
            author: {
              id: data.author_id || 'u_codespark',
              name: data.author_name || 'CodeSpark Official',
              handle: data.author_handle || '@codespark',
              avatar: data.author_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.name}`,
              role: 'Creator',
              followers: 0,
              effects: 1,
              bio: '',
              tags: ['verified'],
              verified: true,
            },
            html_code: data.html_code || '',
            css_code: data.css_code || '',
            js_code: data.js_code || '',
            instructions: data.instructions || '',
            steps: data.steps ? (typeof data.steps === 'string' ? JSON.parse(data.steps) : data.steps) : [],
            createdAt: (data.created_at || '2026-09-01').slice(0, 10),
            interactions: ['hover', 'click'],
            isOfficial: data.is_official ?? true,
          };

          setEffect(eff);
          const initialCode = {
            html: eff.html_code || '',
            css: eff.css_code || '',
            js: eff.js_code || ''
          };
          setCode(initialCode);
          setInitialCustomText(eff);
          if (Array.isArray(eff.steps) && eff.steps.length > 0) {
            setSteps(eff.steps);
          } else {
            generateDefaultSteps(initialCode, eff);
          }

          // Auto-expand category
          if (eff.category) {
            setOpenCategories((prev) => ({ ...prev, [eff.category.toLowerCase()]: true }));
          }

          if (initialCode.html) setActiveCodeTab('html');
          else if (initialCode.css) setActiveCodeTab('css');
          else if (initialCode.js) setActiveCodeTab('js');
          else setActiveCodeTab('react');

          setLoading(false);
          return;
        }
      } catch {}

      // Fallback to API / Mocks
      fetch(`/api/effects/${activeEffectSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.effect) {
            const eff = data.effect;
            setEffect(eff);
            const initialCode = {
              html: eff.html_code || '',
              css: eff.css_code || '',
              js: eff.js_code || ''
            };
            setCode(initialCode);
            setInitialCustomText(eff);
            if (Array.isArray(eff.steps) && eff.steps.length > 0) {
              setSteps(eff.steps);
            } else {
              generateDefaultSteps(initialCode, eff);
            }
            if (eff.category) {
              setOpenCategories((prev) => ({ ...prev, [eff.category.toLowerCase()]: true }));
            }
            setActiveCodeTab(initialCode.html ? 'html' : 'css');
          } else {
            fallbackToMock();
          }
        })
        .catch(() => fallbackToMock())
        .finally(() => setLoading(false));
    };

    fetchDetail();
  }, [activeEffectSlug]);

  // Reset scroll on right content pane when route changes
  useEffect(() => {
    if (rightContentAreaRef.current) {
      rightContentAreaRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Auto-scroll sidebar to active effect
  useEffect(() => {
    if (activeSidebarItemRef.current) {
      activeSidebarItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname, allEffects, openCategories]);

  const setInitialCustomText = (eff: Effect) => {
    if (eff.category === 'hover' || eff.name.toLowerCase().includes('button')) {
      setCustomText(eff.name || 'Get Started');
      setCustomSubText('Click or hover to experience micro-interaction');
    } else if (eff.category === 'card' || eff.category === '3d') {
      setCustomText(eff.name || 'Interactive Card');
      setCustomSubText('Hover & move cursor to test 3D depth and highlights');
    } else {
      setCustomText('CODESPARK');
      setCustomSubText('Smooth UI interaction');
    }
  };

  const fallbackToMock = () => {
    const found = defaultEffects.find((e) => e.slug === activeEffectSlug || e.id === activeEffectSlug);
    if (found) {
      setEffect(found);
      const mockCode = effectCode[found.id] || { html: '', css: '', js: '' };
      const c = { html: mockCode.html || '', css: mockCode.css || '', js: mockCode.js || '' };
      setCode(c);
      setInitialCustomText(found);
      generateDefaultSteps(c, found);
      if (found.category) {
        setOpenCategories((prev) => ({ ...prev, [found.category.toLowerCase()]: true }));
      }
      setActiveCodeTab(c.html ? 'html' : 'css');
    } else {
      setEffect(null);
    }
  };

  const generateDefaultSteps = (c: { html: string; css: string; js: string }, eff?: Effect | null) => {
    const defaultStepsList: EffectStep[] = [];

    if (c.html && c.html.trim()) {
      defaultStepsList.push({
        step: 1,
        title: 'HTML Structure',
        desc: 'Place this component markup inside your HTML or component template.',
        code: c.html,
        lang: 'html'
      });
    }

    if (c.css && c.css.trim()) {
      defaultStepsList.push({
        step: defaultStepsList.length + 1,
        title: 'CSS Styles & Keyframes',
        desc: 'Add these styling rules and easing curves to your stylesheet.',
        code: c.css,
        lang: 'css'
      });
    }

    if (c.js && c.js.trim()) {
      defaultStepsList.push({
        step: defaultStepsList.length + 1,
        title: 'JavaScript Event Listeners',
        desc: 'Attach interaction listeners after the DOM element is mounted.',
        code: c.js,
        lang: 'js'
      });
    }

    setSteps(defaultStepsList);
  };

  // Build dynamic category list so NO category is ever omitted
  const categoryList = useMemo(() => {
    const map = new Map<string, { key: string; label: string; icon: string }>();

    // Standard preset categories
    defaultCategories.filter((c) => c.key !== 'all').forEach((c) => {
      map.set(c.key.toLowerCase(), c);
    });

    // Dynamically add any custom category from actual database effects
    allEffects.forEach((eff) => {
      const catKey = (eff.category || 'misc').toLowerCase();
      if (!map.has(catKey)) {
        map.set(catKey, {
          key: catKey,
          label: eff.categoryLabel || (catKey.charAt(0).toUpperCase() + catKey.slice(1)),
          icon: 'ri-sparkling-2-line'
        });
      }
    });

    return Array.from(map.values());
  }, [allEffects]);

  // Group all effects dynamically by category for sidebar
  const groupedEffects = useMemo(() => {
    const search = sidebarSearch.trim().toLowerCase();
    const map: Record<string, Effect[]> = {};

    categoryList.forEach((c) => {
      map[c.key] = [];
    });

    allEffects.forEach((eff) => {
      if (search) {
        const matches =
          eff.name.toLowerCase().includes(search) ||
          eff.category.toLowerCase().includes(search) ||
          eff.tags.some((t) => t.toLowerCase().includes(search));
        if (!matches) return;
      }

      const catKey = (eff.category || 'misc').toLowerCase();
      if (!map[catKey]) {
        map[catKey] = [];
      }
      map[catKey].push(eff);
    });

    return map;
  }, [allEffects, sidebarSearch, categoryList]);

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey] === undefined ? false : !prev[catKey]
    }));
  };

  const isCatOpen = (catKey: string) => {
    if (sidebarSearch.trim()) return true;
    return openCategories[catKey] !== false;
  };

  // Previous & Next navigation for Manual Docs
  const currentDocIndex = MANUAL_DOCS.findIndex((d) => d.slug === currentDoc?.slug);
  const prevDoc = currentDocIndex > 0 ? MANUAL_DOCS[currentDocIndex - 1] : null;
  const nextDoc = currentDocIndex >= 0 && currentDocIndex < MANUAL_DOCS.length - 1 ? MANUAL_DOCS[currentDocIndex + 1] : null;

  // Previous & Next navigation for Database Effects
  const currentEffectIndex = allEffects.findIndex((e) => e.slug === activeEffectSlug || e.id === activeEffectSlug);
  const prevEffect = currentEffectIndex > 0 ? allEffects[currentEffectIndex - 1] : null;
  const nextEffect = currentEffectIndex >= 0 && currentEffectIndex < allEffects.length - 1 ? allEffects[currentEffectIndex + 1] : null;

  // React Component Lookup for trusted React effects
  const matchedReactKey = useMemo(() => {
    if (!effect) return null;
    const cleanSlug = effect.slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanName = effect.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    for (const key of Object.keys(EFFECT_REGISTRY)) {
      const cleanKey = key.toLowerCase();
      if (cleanSlug.includes(cleanKey) || cleanName.includes(cleanKey) || cleanKey.includes(cleanSlug)) {
        return key;
      }
    }
    return null;
  }, [effect]);

  const ReactComponent = matchedReactKey ? EFFECT_REGISTRY[matchedReactKey] : null;
  const reactSourceSnippet = matchedReactKey ? REACT_CODE_SNIPPETS[matchedReactKey] : null;

  // Dynamic Author resolution (Community Creator vs CodeSpark Official for React)
  const displayAuthor = useMemo(() => {
    if (matchedReactKey || effect?.isOfficial) {
      return {
        name: 'CodeSpark Official',
        handle: '@codespark',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CodeSparkOfficial',
        role: 'Core System',
        isOfficial: true,
        badge: 'Official Component'
      };
    }

    const name = effect?.author?.name && effect.author.name !== 'Chetan Prajapat' && effect.author.name !== 'CodeSpark Official'
      ? effect.author.name
      : (effect?.author?.name || 'Community Creator');
    const handle = effect?.author?.handle || `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const avatar = effect?.author?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

    return {
      name,
      handle,
      avatar,
      role: effect?.author?.role || 'Creator',
      isOfficial: false,
      badge: 'Verified Creator'
    };
  }, [matchedReactKey, effect]);

  // Available code tabs (only show implementations that actually exist)
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string; icon: string; color: string }[] = [];
    if (code.html && code.html.trim()) {
      list.push({ key: 'html', label: 'HTML', icon: 'ri-html5-line', color: 'text-orange-500' });
    }
    if (code.css && code.css.trim()) {
      list.push({ key: 'css', label: 'CSS', icon: 'ri-css3-line', color: 'text-blue-500' });
    }
    if (code.js && code.js.trim()) {
      list.push({ key: 'js', label: 'JavaScript', icon: 'ri-javascript-line', color: 'text-amber-500' });
    }
    if (reactSourceSnippet) {
      list.push({ key: 'react', label: 'React (TSX)', icon: 'ri-reactjs-line', color: 'text-cyan-500' });
    }
    if (list.length > 1) {
      list.push({ key: 'bundle', label: 'Full Bundle', icon: 'ri-file-code-line', color: 'text-primary-500' });
    }
    return list;
  }, [code, reactSourceSnippet]);

  const onLike = () => {
    if (effect) toggleLike(effect.id);
  };

  const onSave = () => {
    if (effect) toggleSave(effect);
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch { /* noop */ }
  };

  // Customized bundle
  const customizedCodeBundle = useMemo(() => {
    let processedHtml = code.html;
    let processedCss = code.css;

    if (customText && customText.trim()) {
      processedHtml = processedHtml.replace(
        /(<(h1|h2|h3|h4|button|span|a)[^>]*>)(.*?)(<\/\2>)/i,
        `$1${customText}$3`
      );
    }
    if (customSubText && customSubText.trim()) {
      processedHtml = processedHtml.replace(/(<p[^>]*>)(.*?)(<\/p>)/i, `$1${customSubText}$3`);
    }
    if (customColor && customColor.toLowerCase() !== '#ff4d2e') {
      processedCss = processedCss
        .replace(/#ff4d2e/gi, customColor)
        .replace(/#ff6b35/gi, customColor);
    }

    return {
      html: processedHtml,
      css: processedCss,
      js: code.js,
      fullBundle: [
        processedHtml ? `<!-- HTML -->\n${processedHtml}` : '',
        processedCss ? `/* CSS */\n${processedCss}` : '',
        code.js ? `// JavaScript\n${code.js}` : ''
      ]
        .filter(Boolean)
        .join('\n\n')
    };
  }, [code, customText, customSubText, customColor]);

  const copyCurrentCode = async () => {
    let textToCopy = '';
    if (activeCodeTab === 'html') textToCopy = customizedCodeBundle.html;
    else if (activeCodeTab === 'css') textToCopy = customizedCodeBundle.css;
    else if (activeCodeTab === 'js') textToCopy = customizedCodeBundle.js;
    else if (activeCodeTab === 'react') textToCopy = reactSourceSnippet || '';
    else textToCopy = customizedCodeBundle.fullBundle;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const copyStepSnippet = async (stepIdx: number, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedStep(stepIdx);
      setTimeout(() => setCopiedStep(null), 1600);
    } catch { /* noop */ }
  };

  const resetCustomizer = () => {
    if (effect) setInitialCustomText(effect);
    setCustomColor('#FF4D2E');
    setDeviceView('desktop');
    setDarkStage(false);
    setStageKey((k) => k + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-background-50 overflow-hidden w-full max-w-full">
      {/* Top Global CodeSpark Navbar */}
      <Navbar />

      {/* Main Documentation & Effects Workspace (Cleanly starts below Navbar) */}
      <div className="flex-1 min-h-0 flex overflow-hidden w-full max-w-full pt-16 sm:pt-20">
        {/* ========================================================================= */}
        {/* LEFT PANE: DOCUMENTATION & COMPONENTS SIDEBAR (Independent Scroll Area)   */}
        {/* ========================================================================= */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-full border-r border-background-300/70 bg-background-50 overflow-hidden select-none">
          {/* Sidebar Top Search */}
          <div className="p-3.5 border-b border-background-300/50 space-y-2 shrink-0 bg-background-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground-500 flex items-center gap-1.5">
                <i className="ri-book-read-line text-primary-500 text-xs" />
                <span>Effects Library</span>
              </span>
              <span className="text-[10px] font-bold text-foreground-500 bg-background-200/80 px-1.5 py-0.5 rounded-md">
                {allEffects.length} items
              </span>
            </div>

            <div className="relative">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-foreground-400" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Filter effects..."
                className="w-full rounded-lg border border-background-300/80 bg-background-100/80 pl-7 pr-7 py-1.5 text-xs outline-none focus:border-primary-400 text-foreground-950 placeholder:text-foreground-400 transition-colors"
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-700 text-xs"
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Navigation Tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin pb-28">
            {/* TYPE A: MANUAL DOCUMENTATION SECTIONS */}
            {!sidebarSearch && (
              <div className="space-y-4">
                {MANUAL_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground-400 px-2 py-0.5">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = isDocRoute && currentDoc?.slug === item.slug;
                        return (
                          <Link
                            key={item.id}
                            to={`/effects/docs/${item.slug}`}
                            ref={isActive ? activeSidebarItemRef : null}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                              isActive
                                ? 'bg-primary-500/15 text-primary-600 font-bold border-l-2 border-primary-500 shadow-xs'
                                : 'text-foreground-600 hover:bg-background-200/60 hover:text-foreground-950'
                            }`}
                          >
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold text-foreground-400 bg-background-200 px-1 py-0.2 rounded">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TYPE B: DATABASE-DRIVEN COMPONENTS / EFFECTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 pt-1 border-t border-background-300/40">
                <p className="text-[11px] font-black uppercase tracking-wider text-foreground-500 flex items-center gap-1.5">
                  <i className="ri-sparkling-2-fill text-primary-500 text-xs" />
                  <span>Components</span>
                </p>
                <span className="text-[9px] font-bold text-foreground-400 bg-background-200 px-1.5 py-0.5 rounded">
                  {allEffects.length}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {categoryList.map((cat) => {
                  const effList = groupedEffects[cat.key] || [];
                  if (effList.length === 0) return null;
                  const open = isCatOpen(cat.key);

                  return (
                    <div key={cat.key} className="space-y-1">
                      {/* Collapsible Category Header with Database Count */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.key)}
                        className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-foreground-400 hover:text-foreground-800 transition-colors group cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <i
                            className={`text-xs transition-transform duration-200 ${
                              open ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'
                            }`}
                          />
                          <span>{cat.label}</span>
                        </span>
                        <span className="text-[9px] font-bold text-foreground-400 bg-background-200/70 px-1.5 py-0.2 rounded group-hover:bg-background-300 transition-colors">
                          {effList.length}
                        </span>
                      </button>

                      {/* Effects List Items */}
                      {open && (
                        <div className="space-y-0.5 border-l border-background-300/50 ml-3 pl-1.5 transition-all">
                          {effList.map((e) => {
                            const isActive = !isDocRoute && (e.slug === activeEffectSlug || e.id === activeEffectSlug);
                            return (
                              <Link
                                key={e.id}
                                to={`/effects/${e.slug}`}
                                ref={isActive ? activeSidebarItemRef : null}
                                className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                  isActive
                                    ? 'bg-primary-500/15 text-primary-600 font-bold border-l-2 border-primary-500 shadow-xs'
                                    : 'text-foreground-700 hover:bg-background-200/60 hover:text-foreground-950'
                                }`}
                              >
                                <span className="truncate">{e.name}</span>
                                <span
                                  title={`Difficulty: ${e.difficulty}`}
                                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                    isActive
                                      ? 'bg-primary-500 ring-2 ring-primary-500/30'
                                      : e.difficulty === 'easy'
                                        ? 'bg-emerald-500/80'
                                        : e.difficulty === 'medium'
                                          ? 'bg-amber-500/80'
                                          : 'bg-purple-500/80'
                                  }`}
                                />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT PANE: MAIN DOCUMENTATION CONTENT (Independent Scroll Area)          */}
        {/* ========================================================================= */}
        <div
          ref={rightContentAreaRef}
          className="flex-1 min-h-0 h-full overflow-y-auto scrollbar-thin bg-background-50 flex flex-col justify-between"
        >
          <main className="p-4 sm:p-8 lg:p-10 pb-16 max-w-4xl mx-auto w-full space-y-8 flex-1">
            {/* Mobile Drawer Bar (< md) */}
            <div className="md:hidden border-b border-background-300/60 pb-3">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-background-300 bg-background-100 px-4 py-2.5 text-xs font-semibold text-foreground-950 shadow-sm active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <i className="ri-menu-2-line text-primary-500 text-sm" />
                  <span className="text-foreground-500 font-normal">Docs & Effects:</span>
                  <span className="font-bold truncate">{isDocRoute ? currentDoc?.title : effect?.name || 'Browse Library'}</span>
                </div>
                <span className="flex items-center gap-1 text-primary-600 text-[11px] font-bold shrink-0 ml-2">
                  <span>Browse</span>
                  <i className="ri-arrow-down-s-line text-sm" />
                </span>
              </button>
            </div>

            {/* Mobile Drawer Modal */}
            {mobileDrawerOpen && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                  onClick={() => setMobileDrawerOpen(false)}
                />
                <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background-50 p-5 shadow-2xl animate-fade-in z-50">
                  <div className="flex items-center justify-between border-b border-background-300/60 pb-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-book-read-line text-primary-500 text-lg" />
                      <span className="font-display text-base font-bold text-foreground-950">Documentation & Effects</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-foreground-500 hover:bg-background-200"
                    >
                      <i className="ri-close-line text-lg" />
                    </button>
                  </div>

                  <div className="mt-3 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground-400" />
                    <input
                      type="text"
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      placeholder="Search effects..."
                      className="w-full rounded-lg border border-background-300 bg-background-100 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary-400 text-foreground-950"
                    />
                  </div>

                  <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-5 pb-16">
                    {/* Manual Docs on Mobile */}
                    {!sidebarSearch && (
                      <div className="space-y-4">
                        {MANUAL_SECTIONS.map((section) => (
                          <div key={section.title} className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-foreground-400 px-2">
                              {section.title}
                            </p>
                            <div className="space-y-0.5">
                              {section.items.map((item) => {
                                const isActive = isDocRoute && currentDoc?.slug === item.slug;
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/effects/docs/${item.slug}`}
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                      isActive
                                        ? 'bg-primary-500/15 text-primary-600 font-bold border-l-2 border-primary-500'
                                        : 'text-foreground-700 hover:bg-background-100'
                                    }`}
                                  >
                                    <span>{item.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Components on Mobile */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-foreground-500 px-2 pt-2 border-t border-background-300/40">
                        Components ({allEffects.length})
                      </p>
                      {categoryList.map((cat) => {
                        const effList = groupedEffects[cat.key] || [];
                        if (effList.length === 0) return null;
                        return (
                          <div key={cat.key} className="space-y-1">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 flex items-center justify-between px-2">
                              <span>{cat.label}</span>
                              <span className="rounded bg-background-200 px-1 py-0.2 text-[9px] font-bold text-foreground-600">
                                {effList.length}
                              </span>
                            </p>
                            <div className="space-y-0.5">
                              {effList.map((e) => {
                                const isActive = !isDocRoute && (e.slug === activeEffectSlug || e.id === activeEffectSlug);
                                return (
                                  <Link
                                    key={e.id}
                                    to={`/effects/${e.slug}`}
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${
                                      isActive
                                        ? 'bg-primary-500/15 text-primary-600 font-bold border-l-2 border-primary-500 shadow-sm'
                                        : 'text-foreground-700 hover:bg-background-100 hover:text-foreground-950'
                                    }`}
                                  >
                                    <span className="truncate">{e.name}</span>
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                      e.difficulty === 'easy' ? 'bg-emerald-500' : e.difficulty === 'medium' ? 'bg-amber-500' : 'bg-purple-500'
                                    }`} />
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW A: MANUAL DOCUMENTATION CONTENT                                */}
            {/* =================================================================== */}
            {isDocRoute && currentDoc && (
              <div className="space-y-8 animate-fade-in">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-xs text-foreground-500 border-b border-background-300/50 pb-3">
                  <span>Docs</span>
                  <i className="ri-arrow-right-s-line text-foreground-400" />
                  <span>{currentDoc.section}</span>
                  <i className="ri-arrow-right-s-line text-foreground-400" />
                  <span className="font-semibold text-foreground-950">{currentDoc.title}</span>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                  {currentDoc.badge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-primary-600 border border-primary-500/20">
                      {currentDoc.badge}
                    </span>
                  )}
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground-950">
                    {currentDoc.title}
                  </h1>
                  <p className="text-base sm:text-lg text-foreground-600 leading-relaxed max-w-2xl">
                    {currentDoc.description}
                  </p>
                </div>

                {/* Main Heading & Paragraphs */}
                {currentDoc.content.heading && (
                  <div className="space-y-4 pt-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">
                      {currentDoc.content.heading}
                    </h2>
                    {currentDoc.content.paragraphs?.map((p, idx) => (
                      <p key={idx} className="text-sm sm:text-base text-foreground-700 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {/* Callout Boxes */}
                {currentDoc.content.callouts?.map((c, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3 ${
                      c.type === 'tip'
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900'
                        : c.type === 'warning'
                          ? 'border-amber-500/30 bg-amber-500/5 text-amber-900'
                          : 'border-primary-500/30 bg-primary-500/5 text-primary-950'
                    }`}
                  >
                    <i
                      className={`text-lg shrink-0 mt-0.5 ${
                        c.type === 'tip'
                          ? 'ri-lightbulb-line text-emerald-600'
                          : c.type === 'warning'
                            ? 'ri-alert-line text-amber-600'
                            : 'ri-information-line text-primary-600'
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{c.text}</p>
                  </div>
                ))}

                {/* Code Snippets */}
                {currentDoc.content.codeSnippets?.map((snip, idx) => (
                  <div key={idx} className="space-y-2">
                    {snip.title && (
                      <h3 className="font-display text-sm font-bold text-foreground-900">{snip.title}</h3>
                    )}
                    <CodeBlock code={snip.code} lang={snip.lang} />
                  </div>
                ))}

                {/* Subsections */}
                {currentDoc.content.subsections?.map((sub, idx) => (
                  <div key={idx} className="space-y-3 pt-2">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground-950">
                      {sub.title}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground-700 leading-relaxed">{sub.text}</p>
                    {sub.code && <CodeBlock code={sub.code.code} lang={sub.code.lang} />}
                  </div>
                ))}

                {/* Manual Docs Previous / Next Pagination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-background-300/60">
                  {prevDoc ? (
                    <Link
                      to={`/effects/docs/${prevDoc.slug}`}
                      className="flex flex-col rounded-2xl border border-background-300 bg-background-50 p-4 transition-all hover:border-primary-400 hover:bg-background-100 group shadow-xs"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 flex items-center gap-1">
                        <i className="ri-arrow-left-line text-xs text-primary-500 group-hover:-translate-x-1 transition-transform" />
                        <span>Previous Guide</span>
                      </span>
                      <span className="font-display text-sm font-bold text-foreground-950 mt-1 truncate">
                        {prevDoc.title}
                      </span>
                    </Link>
                  ) : <div />}

                  {nextDoc ? (
                    <Link
                      to={`/effects/docs/${nextDoc.slug}`}
                      className="flex flex-col items-end text-right rounded-2xl border border-background-300 bg-background-50 p-4 transition-all hover:border-primary-400 hover:bg-background-100 group shadow-xs"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 flex items-center gap-1">
                        <span>Next Guide</span>
                        <i className="ri-arrow-right-line text-xs text-primary-500 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="font-display text-sm font-bold text-foreground-950 mt-1 truncate">
                        {nextDoc.title}
                      </span>
                    </Link>
                  ) : <div />}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW B: DATABASE EFFECT DOCUMENTATION CONTENT                       */}
            {/* =================================================================== */}
            {!isDocRoute && effect && (
              <div className="space-y-8 animate-fade-in">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-500 border-b border-background-300/50 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Link to="/effects/docs/introduction" className="hover:text-primary-600 transition-colors">
                      Components
                    </Link>
                    <i className="ri-arrow-right-s-line text-foreground-400" />
                    <span className="capitalize">{effect.categoryLabel || effect.category}</span>
                    <i className="ri-arrow-right-s-line text-foreground-400" />
                    <span className="font-semibold text-foreground-950 truncate max-w-[200px]">
                      {effect.name}
                    </span>
                  </div>
                </div>

                {/* Title & Metadata Header */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-primary-600 border border-primary-500/20">
                      <i className="ri-sparkling-2-fill text-[10px]" /> {effect.categoryLabel || effect.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                      effect.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : effect.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    }`}>
                      {effect.difficulty}
                    </span>
                    <span className="rounded-full bg-background-200/80 px-2 py-0.5 text-[11px] font-medium text-foreground-500">
                      {effect.license || 'MIT License'}
                    </span>
                    {matchedReactKey && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-600 border border-cyan-500/20">
                        <i className="ri-reactjs-line" /> React Ready
                      </span>
                    )}
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground-950">
                    {effect.name}
                  </h1>

                  <p className="text-sm sm:text-base text-foreground-600 leading-relaxed max-w-2xl">
                    {effect.description}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onLike}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all ${
                          isLiked(effect.id)
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-600'
                            : 'border-background-300 bg-background-50 text-foreground-700 hover:bg-background-100'
                        }`}
                      >
                        <i className={isLiked(effect.id) ? 'ri-heart-3-fill text-rose-500 text-sm' : 'ri-heart-3-line text-sm'} />
                        <span>{formatCount(getLikeCount(effect.id))}</span>
                      </button>

                      <button
                        type="button"
                        onClick={onSave}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all ${
                          isSaved(effect.id)
                            ? 'border-primary-500/40 bg-primary-500/10 text-primary-600'
                            : 'border-background-300 bg-background-50 text-foreground-700 hover:bg-background-100'
                        }`}
                      >
                        <i className={isSaved(effect.id) ? 'ri-bookmark-fill text-primary-500 text-sm' : 'ri-bookmark-line text-sm'} />
                        <span>{isSaved(effect.id) ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={onShare}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-background-300 bg-background-50 px-3 text-xs font-semibold text-foreground-700 hover:bg-background-100 transition-all"
                      >
                        <i className={shared ? 'ri-check-line text-emerald-500 text-sm' : 'ri-share-line text-sm'} />
                        <span>{shared ? 'Link Copied!' : 'Share'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={copyCurrentCode}
                      className="btn btn-primary h-9 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <i className={copied ? 'ri-check-line text-sm' : 'ri-file-copy-line text-sm'} />
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                {/* LIVE PREVIEW STAGE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                      <i className="ri-play-circle-line text-primary-500" />
                      <span>Live Preview</span>
                    </h2>

                    {/* Stage Viewport & Controls */}
                    <div className="flex items-center gap-1.5">
                      <div className="hidden sm:flex items-center rounded-lg border border-background-300 bg-background-100 p-0.5 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setDeviceView('desktop')}
                          className={`rounded-md px-2 py-1 transition-all ${
                            deviceView === 'desktop' ? 'bg-background-50 text-foreground-950 shadow-xs font-bold' : 'text-foreground-500 hover:text-foreground-950'
                          }`}
                          title="Desktop view"
                        >
                          <i className="ri-computer-line" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeviceView('tablet')}
                          className={`rounded-md px-2 py-1 transition-all ${
                            deviceView === 'tablet' ? 'bg-background-50 text-foreground-950 shadow-xs font-bold' : 'text-foreground-500 hover:text-foreground-950'
                          }`}
                          title="Tablet view"
                        >
                          <i className="ri-tablet-line" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeviceView('mobile')}
                          className={`rounded-md px-2 py-1 transition-all ${
                            deviceView === 'mobile' ? 'bg-background-50 text-foreground-950 shadow-xs font-bold' : 'text-foreground-500 hover:text-foreground-950'
                          }`}
                          title="Mobile view"
                        >
                          <i className="ri-smartphone-line" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDarkStage((d) => !d)}
                        className={`grid h-8 w-8 place-items-center rounded-lg border transition-all ${
                          darkStage
                            ? 'border-foreground-800 bg-foreground-950 text-amber-400'
                            : 'border-background-300 bg-background-50 text-foreground-600 hover:bg-background-100'
                        }`}
                        title={darkStage ? 'Switch to Light Stage' : 'Switch to Dark Stage'}
                      >
                        <i className={darkStage ? 'ri-sun-line text-sm' : 'ri-moon-line text-sm'} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStageKey((k) => k + 1)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-background-300 bg-background-50 text-foreground-600 hover:bg-background-100 transition-all"
                        title="Reload animation"
                      >
                        <i className="ri-refresh-line text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Stage Frame Container */}
                  <div
                    className={`mx-auto transition-all duration-300 rounded-3xl border ${
                      darkStage
                        ? 'border-background-800 bg-[#141210] shadow-2xl'
                        : 'border-background-300/80 bg-[#FAF6EE] shadow-lg'
                    } p-4 sm:p-8 flex items-center justify-center min-h-[360px] sm:min-h-[420px] relative overflow-hidden`}
                    style={{
                      maxWidth:
                        deviceView === 'mobile'
                          ? '375px'
                          : deviceView === 'tablet'
                            ? '640px'
                            : '100%',
                    }}
                  >
                    {/* 1. If trusted React component exists */}
                    {ReactComponent ? (
                      <div key={`react_${stageKey}`}>
                        <ReactComponent text={customText || effect.name} title={customText || effect.name} />
                      </div>
                    ) : (
                      /* 2. Isolated sandboxed iframe for Database HTML/CSS/JS */
                      <LivePreview
                        key={`preview_${effect.id}_${stageKey}_${customColor}_${customText}`}
                        id={effect.id}
                        html={customizedCodeBundle.html}
                        css={customizedCodeBundle.css}
                        js={customizedCodeBundle.js}
                        darkStage={darkStage}
                        customText={customText}
                        customSubText={customSubText}
                        customColor={customColor}
                        className="w-full h-full min-h-[280px]"
                      />
                    )}
                  </div>

                  {/* Customizer Playground Bar */}
                  <div className="rounded-2xl border border-background-300/70 bg-background-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground-900 flex items-center gap-1.5">
                        <i className="ri-magic-line text-primary-500" />
                        <span>Stage Customizer</span>
                      </span>
                      <button
                        type="button"
                        onClick={resetCustomizer}
                        className="text-[11px] font-semibold text-foreground-500 hover:text-primary-600 transition-colors"
                      >
                        Reset Defaults
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-foreground-600 block mb-1">
                          Component Text
                        </label>
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Customize text..."
                          className="w-full rounded-lg border border-background-300 bg-background-100 px-3 py-1.5 text-xs text-foreground-950 outline-none focus:border-primary-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-foreground-600 block mb-1">
                          Color Preset
                        </label>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {COLOR_PRESETS.map((p) => (
                            <button
                              key={p.hex}
                              type="button"
                              onClick={() => setCustomColor(p.hex)}
                              className={`h-6 w-6 rounded-full transition-all ${p.bg} ${
                                customColor.toLowerCase() === p.hex.toLowerCase()
                                  ? 'ring-2 ring-primary-500 ring-offset-2 scale-110'
                                  : 'opacity-80 hover:opacity-100'
                              }`}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP USAGE GUIDE */}
                {steps.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 className="font-display text-2xl font-bold text-foreground-950 flex items-center gap-2">
                      <i className="ri-guide-line text-primary-500" />
                      <span>Installation & Usage</span>
                    </h2>

                    <div className="space-y-4">
                      {steps.map((s, idx) => (
                        <div
                          key={s.step || idx}
                          className="rounded-2xl border border-background-300/80 bg-background-50 p-5 sm:p-6 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-500/15 text-xs font-black text-primary-600">
                                {s.step || idx + 1}
                              </span>
                              <h3 className="font-display text-sm sm:text-base font-bold text-foreground-950">
                                {s.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyStepSnippet(idx, s.code)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <i className={copiedStep === idx ? 'ri-check-line text-emerald-600' : 'ri-file-copy-line'} />
                              <span>{copiedStep === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {s.desc && (
                            <p className="text-xs text-foreground-600 leading-relaxed">{s.desc}</p>
                          )}

                          <CodeBlock code={s.code} lang={s.lang || 'html'} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEVELOPER CODE TABS */}
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-background-300/60 pb-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-code-s-slash-line text-primary-500 text-lg" />
                      <h2 className="font-display text-xl font-bold text-foreground-950">
                        Component Source Code
                      </h2>
                    </div>

                    {/* Code Tabs */}
                    <div className="flex items-center rounded-xl border border-background-300 bg-background-100 p-1 flex-wrap gap-1">
                      {availableTabs.map((lt) => (
                        <button
                          key={lt.key}
                          type="button"
                          onClick={() => setActiveCodeTab(lt.key)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                            activeCodeTab === lt.key
                              ? 'bg-background-50 text-foreground-950 shadow-xs'
                              : 'text-foreground-600 hover:text-foreground-950'
                          }`}
                        >
                          <i className={`${lt.icon} ${lt.color}`} />
                          <span>{lt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Selected Code Tab */}
                  <div>
                    {activeCodeTab === 'html' && (
                      <CodeBlock code={customizedCodeBundle.html || '<!-- No HTML needed -->'} lang="html" />
                    )}
                    {activeCodeTab === 'css' && (
                      <CodeBlock code={customizedCodeBundle.css || '/* No CSS needed */'} lang="css" />
                    )}
                    {activeCodeTab === 'js' && (
                      <CodeBlock code={customizedCodeBundle.js || '// No JavaScript required'} lang="js" />
                    )}
                    {activeCodeTab === 'react' && reactSourceSnippet && (
                      <CodeBlock code={reactSourceSnippet} lang="js" />
                    )}
                    {activeCodeTab === 'bundle' && (
                      <CodeBlock code={customizedCodeBundle.fullBundle} lang="html" />
                    )}
                  </div>
                </div>

                {/* CREATOR / CREDIT SECTION */}
                <div className="rounded-2xl border border-background-300/80 bg-background-100/50 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={displayAuthor.avatar}
                      alt={displayAuthor.name}
                      className="h-11 w-11 rounded-full border border-background-300 object-cover bg-background-200"
                    />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 block">
                        Created By
                      </span>
                      <span className="font-display text-sm font-bold text-foreground-950">
                        {displayAuthor.name}
                      </span>
                      <span className="text-xs text-foreground-500 block">
                        {displayAuthor.handle}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border ${
                    displayAuthor.isOfficial
                      ? 'bg-primary-500/10 text-primary-600 border-primary-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  }`}>
                    <i className={displayAuthor.isOfficial ? 'ri-sparkling-2-fill' : 'ri-verified-badge-fill'} /> {displayAuthor.badge}
                  </span>
                </div>

                {/* PREV / NEXT EFFECT PAGINATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-background-300/60">
                  {prevEffect ? (
                    <Link
                      to={`/effects/${prevEffect.slug}`}
                      className="flex flex-col rounded-2xl border border-background-300 bg-background-50 p-4 transition-all hover:border-primary-400 hover:bg-background-100 group shadow-xs"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 flex items-center gap-1">
                        <i className="ri-arrow-left-line text-xs text-primary-500 group-hover:-translate-x-1 transition-transform" />
                        <span>Previous Effect</span>
                      </span>
                      <span className="font-display text-sm font-bold text-foreground-950 mt-1 truncate">
                        {prevEffect.name}
                      </span>
                      <span className="text-[11px] text-foreground-500 capitalize">{prevEffect.categoryLabel || prevEffect.category}</span>
                    </Link>
                  ) : <div />}

                  {nextEffect ? (
                    <Link
                      to={`/effects/${nextEffect.slug}`}
                      className="flex flex-col items-end text-right rounded-2xl border border-background-300 bg-background-50 p-4 transition-all hover:border-primary-400 hover:bg-background-100 group shadow-xs"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground-400 flex items-center gap-1">
                        <span>Next Effect</span>
                        <i className="ri-arrow-right-line text-xs text-primary-500 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="font-display text-sm font-bold text-foreground-950 mt-1 truncate">
                        {nextEffect.name}
                      </span>
                      <span className="text-[11px] text-foreground-500 capitalize">{nextEffect.categoryLabel || nextEffect.category}</span>
                    </Link>
                  ) : <div />}
                </div>
              </div>
            )}

            {/* 404 Effect Not Found State */}
            {!isDocRoute && !loading && !effect && (
              <div className="text-center py-20 max-w-md mx-auto space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-500/10 text-3xl text-primary-500 border border-primary-500/20 shadow-sm">
                  <i className="ri-search-eye-line" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground-950">
                  Effect Not Found
                </h1>
                <p className="text-xs sm:text-sm text-foreground-600 leading-relaxed">
                  The effect you are looking for does not exist or has not been published yet.
                </p>
                <div className="pt-2">
                  <Link to="/effects/docs/introduction" className="btn btn-primary h-11 px-6 text-xs sm:text-sm font-bold shadow-md">
                    <i className="ri-arrow-left-line text-base" /> Return to Documentation
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* CodeSpark Footer (Appears smoothly at the bottom of the right scrollable content area) */}
          <div className="w-full shrink-0 border-t border-background-300/60 bg-background-100/50 pb-8">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}