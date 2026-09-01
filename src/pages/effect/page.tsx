import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import LivePreview from '@/components/feature/LivePreview';
import EffectCard from '@/components/feature/EffectCard';
import CodeBlock from '@/components/feature/CodeBlock';
import Reveal from '@/components/base/Reveal';
import { formatCount } from '@/components/feature/EffectCard';
import { effects as defaultEffects, type Effect, type EffectStep } from '@/mocks/effects';
import { effectCode } from '@/mocks/code';
import { useSaved } from '@/context/SavedContext';
import { supabase } from '@/lib/supabase';

type Lang = 'html' | 'css' | 'js';
type DeviceView = 'desktop' | 'tablet' | 'mobile';

const COLOR_PRESETS = [
  { name: 'Flame Orange', hex: '#FF4D2E', bg: 'bg-[#FF4D2E]' },
  { name: 'Emerald Green', hex: '#10B981', bg: 'bg-[#10B981]' },
  { name: 'Cyber Blue', hex: '#3B82F6', bg: 'bg-[#3B82F6]' },
  { name: 'Electric Violet', hex: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
  { name: 'Amber Gold', hex: '#F59E0B', bg: 'bg-[#F59E0B]' },
  { name: 'Neon Pink', hex: '#EC4899', bg: 'bg-[#EC4899]' },
];

const langTabs: { key: Lang; label: string; icon: string; color: string }[] = [
  { key: 'html', label: 'HTML', icon: 'ri-html5-line', color: 'text-orange-500' },
  { key: 'css', label: 'CSS', icon: 'ri-css3-line', color: 'text-blue-500' },
  { key: 'js', label: 'JavaScript', icon: 'ri-javascript-line', color: 'text-amber-500' },
];

export default function EffectDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isCustomizerMode = searchParams.get('mode') === 'customizer' || searchParams.get('mode') === 'playground';

  const [effect, setEffect] = useState<Effect | null>(() => {
    const found = defaultEffects.find((e) => e.slug === slug || e.id === slug);
    return found || null;
  });

  // Original developer's source code (Read-only, protected)
  const [code, setCode] = useState<{ html: string; css: string; js: string }>({
    html: '',
    css: '',
    js: ''
  });

  // User Customizer Interactive States (For testing text & theme without touching code)
  const [customText, setCustomText] = useState('');
  const [customSubText, setCustomSubText] = useState('');
  const [customColor, setCustomColor] = useState('#FF4D2E');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [darkStage, setDarkStage] = useState(false);

  const { isSaved, toggleSave, isLiked, toggleLike, getLikeCount } = useSaved();
  const [steps, setSteps] = useState<EffectStep[]>([]);
  const [tab, setTab] = useState<Lang>('html');
  const [copied, setCopied] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stageKey, setStageKey] = useState(0);

  // Load effect data directly from Supabase Cloud Database
  useEffect(() => {
    setLoading(true);

    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('effects')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
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
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback to API if Supabase offline
      fetch(`/api/effects/${slug}`)
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
          } else {
            fallbackToMock();
          }
        })
        .catch(() => fallbackToMock())
        .finally(() => setLoading(false));
    };

    fetchDetail();
  }, [slug]);

  const setInitialCustomText = (eff: Effect) => {
    // Determine friendly default preview text based on effect name / category
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
    const found = defaultEffects.find((e) => e.slug === slug || e.id === slug);
    if (found) {
      setEffect(found);
      const mockCode = effectCode[found.id] || { html: '', css: '', js: '' };
      const c = { html: mockCode.html || '', css: mockCode.css || '', js: mockCode.js || '' };
      setCode(c);
      setInitialCustomText(found);
      generateDefaultSteps(c, found);
    }
  };

  const generateDefaultSteps = (c: { html: string; css: string; js: string }, eff?: Effect | null) => {
    const defaultStepsList: EffectStep[] = [
      {
        step: 1,
        title: 'HTML Structure',
        desc: 'Place this component markup inside your HTML or component file.',
        code: c.html || `<div class="effect-box"><span>${eff?.name || 'Effect'}</span></div>`,
        lang: 'html'
      },
      {
        step: 2,
        title: 'CSS Styles & Keyframes',
        desc: 'Add these styling rules and easing curves to your stylesheet.',
        code: c.css || `/* CSS rules */`,
        lang: 'css'
      }
    ];

    if (c.js && c.js.trim()) {
      defaultStepsList.push({
        step: 3,
        title: 'JavaScript Event Listeners',
        desc: 'Attach interaction listeners after the DOM element is mounted.',
        code: c.js,
        lang: 'js'
      });
    }

    setSteps(defaultStepsList);
  };

  const related = useMemo(
    () => defaultEffects.filter((e) => e.category === effect?.category && e.id !== effect?.id).slice(0, 3),
    [effect]
  );

  const index = defaultEffects.findIndex((e) => e.slug === slug || e.id === slug);
  const prev = index > 0 ? defaultEffects[index - 1] : null;
  const next = index >= 0 && index < defaultEffects.length - 1 ? defaultEffects[index + 1] : null;

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

  // Generate customized code bundle based on user custom text and color
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

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(customizedCodeBundle.fullBundle);
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

  const tabs: Lang[] = ['html', 'css'];
  if (code.js) tabs.push('js');

  if (!effect && !loading) {
    return (
      <div className="min-h-screen w-full bg-background-50">
        <Navbar />
        <main className="container-x flex flex-col items-center justify-center gap-4 pt-40 pb-24 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-background-200 text-3xl text-foreground-500">
            <i className="ri-error-warning-line" />
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground-950">Effect not found</h1>
          <p className="text-foreground-500">It may have been moved or removed.</p>
          <Link to="/effects" className="btn btn-primary">Back to library</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!effect) {
    return (
      <div className="min-h-screen w-full bg-background-50">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 w-full max-w-full overflow-x-hidden">
        <div className="container-x w-full">
          {/* Breadcrumb Navigation */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-foreground-500">
            <Link to="/" className="hover:text-foreground-950">Home</Link>
            <i className="ri-arrow-right-s-line" />
            <Link to="/effects" className="hover:text-foreground-950">Effects</Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-foreground-950 font-medium truncate max-w-[200px] sm:max-w-none">{effect.name}</span>
          </nav>

          {/* Mode Switcher Bar */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-background-300/50 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  searchParams.delete('mode');
                  setSearchParams(searchParams);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  !isCustomizerMode
                    ? 'bg-foreground-950 text-background-50 shadow-sm'
                    : 'text-foreground-600 hover:bg-background-200/70 hover:text-foreground-950'
                }`}
              >
                <i className="ri-book-open-line" /> Overview & Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  searchParams.set('mode', 'customizer');
                  setSearchParams(searchParams);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isCustomizerMode
                    ? 'bg-primary-500 text-background-50 shadow-sm'
                    : 'text-foreground-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <i className="ri-palette-line" /> 🎨 Test With Your Text & Theme
              </button>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={copyAll}
                className="btn btn-primary h-9 px-4 text-xs font-semibold uppercase tracking-wider"
              >
                {copied ? <i className="ri-check-line" /> : <i className="ri-file-copy-line" />}
                {copied ? 'Copied Code!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* CUSTOMIZER MODE: Test with your custom text & theme without touching raw code */}
          {isCustomizerMode ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr] w-full min-w-0">
              {/* Left Column: Interactive Controls (Text, Color, Viewport) */}
              <div className="flex flex-col rounded-2xl border border-background-300/60 bg-background-50 p-5 sm:p-6 shadow-sm space-y-5 min-w-0">
                <div className="flex items-center justify-between border-b border-background-200 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                      <i className="ri-sound-module-line text-primary-500" /> Interactive Preview Controls
                    </h3>
                    <p className="text-xs text-foreground-500 mt-0.5">
                      Type your own text and choose a theme to preview live.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetCustomizer}
                    className="text-xs font-medium text-foreground-500 hover:text-primary-600 flex items-center gap-1"
                  >
                    <i className="ri-restart-line" /> Reset
                  </button>
                </div>

                {/* 1. Custom Text Input */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span>Main Text / Headline</span>
                    <span className="text-[10px] text-foreground-400 font-normal">Updates preview live</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. Sign Up Today, My Brand, Explore..."
                  />
                </div>

                {/* 2. Subtitle / Secondary Text Input */}
                <div>
                  <label className="label">Secondary Text / Tagline</label>
                  <input
                    type="text"
                    className="input"
                    value={customSubText}
                    onChange={(e) => setCustomSubText(e.target.value)}
                    placeholder="e.g. Hover to experience smooth physics"
                  />
                </div>

                {/* 3. Theme Color Presets */}
                <div>
                  <label className="label mb-2 flex items-center justify-between">
                    <span>Theme / Accent Color</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: customColor }}>{customColor}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setCustomColor(p.hex)}
                        title={p.name}
                        className={`grid h-8 w-8 place-items-center rounded-full transition-transform ${p.bg} ${
                          customColor.toLowerCase() === p.hex.toLowerCase()
                            ? 'ring-2 ring-foreground-950 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        {customColor.toLowerCase() === p.hex.toLowerCase() && (
                          <i className="ri-check-line text-white text-xs" />
                        )}
                      </button>
                    ))}
                    {/* Custom Color Input */}
                    <label className="relative grid h-8 w-8 place-items-center rounded-full border border-background-400 bg-background-200 cursor-pointer hover:border-foreground-950">
                      <i className="ri-palette-fill text-xs text-foreground-600" />
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Pick custom color"
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Responsive Device Frame Switcher */}
                <div>
                  <label className="label mb-2">Simulate Screen Size (Responsive Preview)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeviceView('desktop')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all ${
                        deviceView === 'desktop'
                          ? 'bg-foreground-950 text-background-50 border-foreground-950 shadow-sm'
                          : 'bg-background-100 border-background-300 text-foreground-600 hover:bg-background-200'
                      }`}
                    >
                      <i className="ri-macbook-line" /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceView('tablet')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all ${
                        deviceView === 'tablet'
                          ? 'bg-foreground-950 text-background-50 border-foreground-950 shadow-sm'
                          : 'bg-background-100 border-background-300 text-foreground-600 hover:bg-background-200'
                      }`}
                    >
                      <i className="ri-tablet-line" /> Tablet
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceView('mobile')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all ${
                        deviceView === 'mobile'
                          ? 'bg-foreground-950 text-background-50 border-foreground-950 shadow-sm'
                          : 'bg-background-100 border-background-300 text-foreground-600 hover:bg-background-200'
                      }`}
                    >
                      <i className="ri-smartphone-line" /> Mobile
                    </button>
                  </div>
                </div>

                {/* 5. Copy Customized Code Button */}
                <div className="pt-2 border-t border-background-200">
                  <button
                    type="button"
                    onClick={copyAll}
                    className="btn btn-primary h-11 w-full text-xs font-semibold uppercase tracking-wider"
                  >
                    <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
                    {copied ? 'Copied Customized Code!' : 'Copy Code With My Text & Colors'}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Simulated Preview Frame */}
              <div className="flex flex-col space-y-4 min-w-0 w-full">
                <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-lg">
                  {/* Stage Toolbar */}
                  <div className="flex items-center justify-between border-b border-background-300/50 px-4 py-3 bg-background-100/70">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-foreground-950">
                        Live Preview ({deviceView.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDarkStage(!darkStage)}
                        className="chip text-[11px] bg-background-50"
                      >
                        <i className={darkStage ? 'ri-sun-line text-amber-500' : 'ri-moon-line'} />
                        {darkStage ? 'Dark' : 'Light'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStageKey((k) => k + 1)}
                        title="Replay / Re-run"
                        className="grid h-7 w-7 place-items-center rounded-md text-foreground-600 hover:bg-background-200"
                      >
                        <i className="ri-restart-line text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Stage Simulation Area */}
                  <div className="relative flex items-center justify-center p-3 sm:p-6 bg-background-200/40 min-h-[340px] sm:min-h-[400px] overflow-hidden">
                    <div
                      className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-md border border-background-300/60 ${
                        deviceView === 'mobile'
                          ? 'w-[320px] h-[380px]'
                          : deviceView === 'tablet'
                          ? 'w-[500px] h-[390px]'
                          : 'w-full h-[390px]'
                      }`}
                    >
                      <LivePreview
                        key={stageKey}
                        id={effect.id}
                        html={code.html}
                        css={code.css}
                        js={code.js}
                        darkStage={darkStage}
                        customText={customText}
                        customSubText={customSubText}
                        customColor={customColor}
                      />
                    </div>
                  </div>

                  {/* Quick Tip Footer */}
                  <div className="border-t border-background-300/40 px-4 py-3 bg-background-50 flex items-center justify-between text-xs text-foreground-500">
                    <span>
                      <i className="ri-cursor-line mr-1 text-primary-500" /> Move cursor or touch to test interaction
                    </span>
                    <span className="font-medium text-foreground-800">{effect.categoryLabel}</span>
                  </div>
                </div>

                {/* Customized Code Quick Preview */}
                <div className="rounded-2xl border border-background-300/60 bg-background-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground-950 uppercase tracking-wider">
                      Generated Code (Customized)
                    </span>
                    <button
                      type="button"
                      onClick={copyAll}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      <i className="ri-file-copy-line" /> Copy Snippet
                    </button>
                  </div>
                  <pre className="code-scroll max-h-32 overflow-auto rounded-xl bg-foreground-950 p-3 font-mono text-[11px] text-background-200 leading-relaxed">
                    {customizedCodeBundle.html}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD OVERVIEW & STEP-BY-STEP IMPLEMENTATION GUIDE */
            <div>
              {/* Main Top Section: Live Preview (Left) + Details/Actions (Right) */}
              <Reveal>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr] w-full min-w-0">
                  {/* Live Interactive Effect Stage */}
                  <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-md flex flex-col min-w-0">
                    {/* Stage Toolbar */}
                    <div className="flex items-center justify-between border-b border-background-300/50 px-4 py-3 bg-background-100/50">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-foreground-950">Live Interactive Stage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDarkStage((v) => !v)}
                          className="chip text-[11px] bg-background-50"
                        >
                          <i className={darkStage ? 'ri-sun-line text-amber-500' : 'ri-moon-line'} />
                          {darkStage ? 'Dark' : 'Light'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStageKey((k) => k + 1)}
                          title="Replay Animation"
                          className="grid h-7 w-7 place-items-center rounded-md text-foreground-600 hover:bg-background-200"
                        >
                          <i className="ri-restart-line text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Stage */}
                    <div className="h-[280px] sm:h-[360px] w-full relative">
                      <LivePreview
                        key={stageKey}
                        id={effect.id}
                        html={code.html}
                        css={code.css}
                        js={code.js}
                        darkStage={darkStage}
                      />
                    </div>

                    {/* Stage Bottom Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-background-300/50 px-4 py-3 bg-background-50">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={onLike}
                          className={`chip ${isLiked(effect.id) ? 'chip-active !border-rose-500 text-rose-500 font-bold' : ''}`}
                        >
                          <i className={isLiked(effect.id) ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} /> {formatCount(getLikeCount(effect.id))}
                        </button>
                        <button
                          onClick={onSave}
                          className={`chip ${isSaved(effect.id) ? 'chip-active !border-primary-500 text-primary-600 font-bold' : ''}`}
                        >
                          <i className={isSaved(effect.id) ? 'ri-bookmark-fill text-primary-600' : 'ri-bookmark-line'} /> {isSaved(effect.id) ? 'Saved' : 'Save'}
                        </button>
                        <button onClick={onShare} className="chip">
                          <i className={shared ? 'ri-check-line text-emerald-600' : 'ri-share-line'} /> {shared ? 'Link copied' : 'Share'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            searchParams.set('mode', 'customizer');
                            setSearchParams(searchParams);
                          }}
                          className="btn btn-secondary h-9 px-3.5 text-xs font-semibold"
                        >
                          <i className="ri-palette-line text-primary-500" /> Test Your Text
                        </button>
                        <button onClick={copyAll} className="btn btn-primary h-9 px-4 text-xs font-semibold">
                          <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} /> {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar: Effect Information & Creator Metadata */}
                  <aside className="flex flex-col gap-4 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600 border border-primary-500/20">
                          {effect.categoryLabel}
                        </span>
                        <span className="rounded-full bg-background-200 px-3 py-1 text-xs font-medium capitalize text-foreground-600 border border-background-300">
                          {effect.difficulty}
                        </span>
                        <span className="rounded-full bg-background-200 px-3 py-1 text-xs font-medium text-foreground-600 border border-background-300">
                          {effect.license} License
                        </span>
                      </div>
                      <h1 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950 break-words">
                        {effect.name}
                      </h1>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground-600">
                        {effect.description}
                      </p>
                    </div>

                    {/* Official Verified Author Box */}
                    <div className="flex items-center gap-3 rounded-2xl border border-background-300/60 bg-background-50 p-4 shadow-sm">
                      <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-primary-500 text-lg font-bold text-white shadow-md shrink-0">
                        ⚡
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground-950 truncate flex items-center gap-1.5">
                          {effect.author?.name || 'CodeSpark Official'}
                          <i className="ri-verified-badge-fill text-primary-500 text-sm shrink-0" title="Verified Official Component" />
                        </p>
                        <p className="text-xs text-foreground-500 truncate">{effect.author?.handle || '@codespark'} · Official Component</p>
                      </div>
                      <span className="rounded-full bg-primary-500/10 px-2.5 py-1 text-[11px] font-bold text-primary-600 border border-primary-500/20 shrink-0">
                        Verified
                      </span>
                    </div>

                    {/* Metadata Card */}
                    <div className="rounded-2xl border border-background-300/60 bg-background-50 p-4 shadow-sm">
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-foreground-400">Specs & Stats</p>
                      <dl className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between border-b border-background-200/60 pb-1.5">
                          <dt className="text-foreground-500">Total Views</dt>
                          <dd className="text-foreground-950 font-semibold">{formatCount(effect.views)}</dd>
                        </div>
                        <div className="flex justify-between border-b border-background-200/60 pb-1.5">
                          <dt className="text-foreground-500">Saves / Stars</dt>
                          <dd className="text-foreground-950 font-semibold">{formatCount(effect.saves)}</dd>
                        </div>
                        <div className="flex justify-between border-b border-background-200/60 pb-1.5">
                          <dt className="text-foreground-500">Updated</dt>
                          <dd className="text-foreground-950 font-semibold">{effect.createdAt}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-foreground-500">Framework</dt>
                          <dd className="text-emerald-600 font-semibold">HTML / CSS / React Ready</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Tags */}
                    <div className="rounded-2xl border border-background-300/60 bg-background-50 p-4 shadow-sm">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground-400">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {effect.tags.map((t) => (
                          <button
                            key={t}
                            onClick={() => navigate(`/effects?q=${encodeURIComponent(t)}`)}
                            className="chip text-[11px]"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Next / Prev Navigation */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      {prev ? (
                        <button
                          onClick={() => navigate(`/effects/${prev.slug}`)}
                          className="btn btn-ghost !px-0 text-xs font-body truncate"
                        >
                          <i className="ri-arrow-left-line" /> {prev.name}
                        </button>
                      ) : <span />}
                      {next ? (
                        <button
                          onClick={() => navigate(`/effects/${next.slug}`)}
                          className="btn btn-ghost !px-0 text-xs font-body truncate"
                        >
                          {next.name} <i className="ri-arrow-right-line" />
                        </button>
                      ) : <span />}
                    </div>
                  </aside>
                </div>
              </Reveal>

              {/* STEP-BY-STEP "HOW TO USE" / INTEGRATION GUIDE SECTION */}
              <section className="mt-12 rounded-3xl border border-background-300/60 bg-background-50 p-5 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-background-300/50 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-500 text-background-50 text-sm">
                        <i className="ri-book-read-line" />
                      </span>
                      <p className="eyebrow">Integration Guide</p>
                    </div>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
                      Step-by-Step Implementation
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-foreground-500">
                      Follow these precise steps to drop this effect directly into your website or React/Vue/HTML project.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={copyAll}
                      className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider"
                    >
                      <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
                      {copied ? 'Copied Everything!' : 'Copy All Steps'}
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  {steps.map((s, idx) => (
                    <div
                      key={s.step || idx}
                      className="rounded-2xl border border-background-300/60 bg-background-100/40 p-4 sm:p-6 transition-all hover:border-primary-400/40 hover:bg-background-100/70 min-w-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-foreground-950 text-xs font-bold text-background-50 shadow-sm shrink-0">
                            0{s.step || idx + 1}
                          </span>
                          <div>
                            <h3 className="font-body text-sm sm:text-base font-bold text-foreground-950">
                              {s.title}
                            </h3>
                            <p className="text-xs text-foreground-500 mt-0.5">{s.desc}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyStepSnippet(idx, s.code)}
                          className={`btn h-8 px-3 text-xs font-medium self-start sm:self-auto transition-all ${
                            copiedStep === idx
                              ? 'bg-emerald-500 text-background-50'
                              : 'bg-background-50 border border-background-400/80 text-foreground-700 hover:bg-foreground-950 hover:text-background-50'
                          }`}
                        >
                          <i className={copiedStep === idx ? 'ri-check-line' : 'ri-clipboard-line'} />
                          {copiedStep === idx ? 'Copied Step!' : 'Copy Snippet'}
                        </button>
                      </div>

                      {/* Code Block for this step */}
                      <div className="mt-3 overflow-hidden">
                        <CodeBlock code={s.code} lang={s.lang || 'html'} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Complete Code Viewer Section */}
              <section className="mt-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground-950">Developer Source Code</h2>
                    <p className="mt-1 text-xs sm:text-sm text-foreground-500">Read-only clean source code from the author.</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-background-300/50 bg-background-100 p-1 self-start sm:self-auto">
                    {langTabs.filter((t) => tabs.includes(t.key)).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`relative rounded-lg px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                          tab === t.key
                            ? 'bg-foreground-950 text-background-50 shadow-sm'
                            : 'text-foreground-500 hover:text-foreground-950'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 overflow-hidden">
                  <CodeBlock key={tab} code={code[tab] || ''} lang={tab} />
                </div>
              </section>

              {/* Related Effects Section */}
              {related.length > 0 && (
                <section className="mt-14 pb-12 border-t border-background-300/40 pt-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="eyebrow">Explore Similar</p>
                      <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-foreground-950">
                        More {effect.categoryLabel} Interactions
                      </h2>
                    </div>
                    <Link to="/effects" className="btn btn-ghost text-xs sm:text-sm font-body">
                      View all <i className="ri-arrow-right-line" />
                    </Link>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((e, i) => (
                      <Reveal key={e.id} delay={i * 80}>
                        <EffectCard effect={e} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}