import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';
import { useAuth } from '@/context/AuthContext';
import type { EffectStep } from '@/mocks/effects';

type Tab = 'html' | 'css' | 'js';
type DeviceView = 'desktop' | 'tablet' | 'mobile';

const TEMPLATES = [
  {
    name: 'Glow Button',
    category: 'hover',
    difficulty: 'easy',
    description: 'A luminous button with neon atmospheric glow and smooth hover elevation.',
    html: `<button class="glow-btn">Hover for Glow</button>`,
    css: `.glow-btn {
  padding: 14px 32px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #111;
  border: 1px solid rgba(255, 77, 46, 0.4);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glow-btn:hover {
  background: #ff4d2e;
  border-color: #ff4d2e;
  box-shadow: 0 0 25px rgba(255, 77, 46, 0.6), 0 0 50px rgba(255, 77, 46, 0.2);
  transform: translateY(-2px);
}`,
    js: ``,
  },
  {
    name: 'Pulse Ring Loader',
    category: 'loader',
    difficulty: 'easy',
    description: 'Concentric pulsing energy rings that radiate smoothly from a central core.',
    html: `<div class="pulse-ring">
  <div class="ring r1"></div>
  <div class="ring r2"></div>
  <div class="center-dot"></div>
</div>`,
    css: `.pulse-ring {
  position: relative;
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #ff4d2e;
  animation: ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.r2 { animation-delay: -1s; }
.center-dot {
  width: 14px;
  height: 14px;
  background: #ff4d2e;
  border-radius: 50%;
}
@keyframes ripple {
  0% { transform: scale(0.2); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}`,
    js: ``,
  },
  {
    name: 'Interactive Glass Card',
    category: '3d',
    difficulty: 'medium',
    description: 'Frosted glassmorphic surface with dynamic border glow and perspective hover lift.',
    html: `<div class="glass-card">
  <div class="icon">✦</div>
  <h3>Glassmorphic Card</h3>
  <p>Dynamic backdrop blur with luminous gradient border.</p>
</div>`,
    css: `.glass-card {
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: #FAF6EE;
  max-width: 280px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255, 77, 46, 0.5);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}
.icon {
  font-size: 24px;
  color: #ff4d2e;
  margin-bottom: 10px;
}
h3 { font-size: 16px; margin-bottom: 6px; font-weight: 600; }
p { font-size: 12px; color: #a9967f; line-height: 1.5; }`,
    js: ``,
  }
];

export default function SubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [name, setName] = useState('My Custom Effect');
  const [category, setCategory] = useState('hover');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'advanced'>('medium');
  const [tags, setTags] = useState('css, animation, micro-interaction');
  const [license, setLicense] = useState('MIT');
  const [description, setDescription] = useState('A sleek modern UI interaction crafted with clean CSS.');
  
  const [activeTab, setActiveTab] = useState<Tab>('html');
  const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html);
  const [cssCode, setCssCode] = useState(TEMPLATES[0].css);
  const [jsCode, setJsCode] = useState(TEMPLATES[0].js);
  const [instructions, setInstructions] = useState('Follow the steps below to drop this effect directly into your project.');
  const [customSteps, setCustomSteps] = useState<EffectStep[]>([
    { step: 1, title: 'HTML Markup', desc: 'Add the element to your DOM.', code: TEMPLATES[0].html, lang: 'html' },
    { step: 2, title: 'CSS Styles', desc: 'Add CSS animation & theme rules.', code: TEMPLATES[0].css, lang: 'css' }
  ]);

  const [previewDark, setPreviewDark] = useState(true);
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle incoming fork state if coming from EffectDetail "Fork / Remix" button
  useEffect(() => {
    if (location.state) {
      const s = location.state as any;
      if (s.forkedName) setName(s.forkedName);
      if (s.forkedCategory) setCategory(s.forkedCategory);
      if (s.forkedHtml) setHtmlCode(s.forkedHtml);
      if (s.forkedCss) setCssCode(s.forkedCss);
      if (s.forkedJs) setJsCode(s.forkedJs);
      if (s.forkedDescription) setDescription(s.forkedDescription);
      autoGenerateSteps(s.forkedHtml || htmlCode, s.forkedCss || cssCode, s.forkedJs || jsCode);
    }
  }, [location.state]);

  const loadTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setName(t.name);
    setCategory(t.category);
    setDifficulty(t.difficulty as any);
    setDescription(t.description);
    setHtmlCode(t.html);
    setCssCode(t.css);
    setJsCode(t.js);
    autoGenerateSteps(t.html, t.css, t.js);
  };

  const autoGenerateSteps = (html: string, css: string, js: string) => {
    const list: EffectStep[] = [
      { step: 1, title: 'HTML Structure', desc: 'Include the markup in your component template.', code: html, lang: 'html' },
      { step: 2, title: 'CSS Styling', desc: 'Include styles and animation keyframes in your stylesheet.', code: css, lang: 'css' }
    ];
    if (js && js.trim()) {
      list.push({ step: 3, title: 'JavaScript Execution', desc: 'Attach event listeners after DOM is mounted.', code: js, lang: 'js' });
    }
    setCustomSteps(list);
  };

  const addStep = () => {
    setCustomSteps((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        title: `Step ${prev.length + 1}: Customization`,
        desc: 'Additional configuration or styling tip.',
        code: '/* customize here */',
        lang: 'css'
      }
    ]);
  };

  const removeStep = (idx: number) => {
    setCustomSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })));
  };

  const updateStepField = (idx: number, field: keyof EffectStep, val: any) => {
    setCustomSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const iframeSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: ${previewDark ? '#141210' : '#FAF6EE'};
      color: ${previewDark ? '#FAF6EE' : '#0F1115'};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      user-select: none;
    }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode || '<div style="font-size:12px;color:#7e6c60">Live Sandbox Preview</div>'}
  <script>
    try {
      ${jsCode}
    } catch (err) {
      console.warn('Effect Script Error:', err);
    }
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode, previewDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !htmlCode.trim() || !cssCode.trim()) {
      setError('Please provide an Effect Name, HTML code, and CSS code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('codespark_token') || localStorage.getItem('effekt_token')
            ? { Authorization: `Bearer ${localStorage.getItem('codespark_token') || localStorage.getItem('effekt_token')}` }
            : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          difficulty,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          license,
          description: description.trim(),
          html_code: htmlCode,
          css_code: cssCode,
          js_code: jsCode,
          instructions,
          steps: customSteps,
          author_name: user?.name || 'Community Maker',
          author_handle: user ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@maker',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSuccess('Effect successfully published live to the CodeSpark library!');
        setTimeout(() => {
          navigate(data.slug ? `/effects/${data.slug}` : '/effects');
        }, 1200);
      } else {
        setError(data.error || 'Failed to publish effect. Please try again.');
      }
    } catch {
      setError('Network error. Make sure backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-24 w-full max-w-full overflow-x-hidden">
        <div className="container-x w-full">
          {/* Header */}
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Creator Studio</p>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground-950">
                  Effect Creator Studio
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-foreground-500 max-w-xl">
                  Write HTML, CSS, & JS with real-time live preview. No static screenshots needed — your code runs directly in the library!
                </p>
              </div>

              {/* Starter Templates */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-400">Quick Starters:</span>
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => loadTemplate(idx)}
                    className="chip text-xs hover:border-primary-500"
                  >
                    <i className="ri-magic-line text-primary-500" /> {t.name}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Feedback messages */}
          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary-500/10 p-4 text-sm text-primary-600 border border-primary-500/30">
              <i className="ri-error-warning-line text-lg" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600 border border-emerald-500/30">
              <i className="ri-checkbox-circle-line text-lg" />
              <span>{success}</span>
            </div>
          )}

          {/* Main workspace */}
          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] w-full min-w-0">
            {/* Left: Metadata & Code Editors */}
            <div className="space-y-6 min-w-0 w-full">
              {/* Card 1: Effect Details */}
              <div className="rounded-2xl border border-background-300/50 bg-background-50 p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                  <i className="ri-file-info-line text-primary-500" /> 1. Effect Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Effect Name *</label>
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Magnetic Pulse CTA"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="hover">Hover</option>
                      <option value="text">Text</option>
                      <option value="cursor">Cursor</option>
                      <option value="3d">3D / Tilt</option>
                      <option value="loader">Loaders</option>
                      <option value="card">Cards</option>
                      <option value="transition">Transitions</option>
                      <option value="misc">Creative</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="input cursor-pointer"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                    >
                      <option value="easy">Easy (Clean CSS)</option>
                      <option value="medium">Medium (Transitions & Physics)</option>
                      <option value="advanced">Advanced (Complex 3D / Shaders)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">License</label>
                    <select
                      className="input cursor-pointer"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                    >
                      <option value="MIT">MIT (Free for commercial use)</option>
                      <option value="Apache-2.0">Apache 2.0</option>
                      <option value="BSD-2">BSD-2 Clause</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input
                    className="input"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="button, ripple, hover, micro-interaction"
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[70px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how the interaction behaves and what makes it special..."
                  />
                </div>
              </div>

              {/* Card 2: Code Editor Sandbox */}
              <div className="rounded-2xl border border-background-300/50 bg-background-50 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                    <i className="ri-code-s-slash-line text-primary-500" /> 2. Effect Code
                  </h3>
                  <div className="flex gap-1 rounded-lg bg-background-200/70 p-1">
                    {(['html', 'css', 'js'] as Tab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                          activeTab === tab
                            ? 'bg-foreground-950 text-background-50 shadow-sm'
                            : 'text-foreground-600 hover:text-foreground-950'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'html' && (
                  <div>
                    <label className="label">HTML Markup *</label>
                    <textarea
                      className="input font-mono text-xs leading-relaxed min-h-[180px] bg-foreground-950 text-background-200"
                      value={htmlCode}
                      onChange={(e) => {
                        setHtmlCode(e.target.value);
                        autoGenerateSteps(e.target.value, cssCode, jsCode);
                      }}
                      placeholder="<button class='my-effect'>Click Me</button>"
                      required
                      spellCheck={false}
                    />
                  </div>
                )}

                {activeTab === 'css' && (
                  <div>
                    <label className="label">CSS Styles *</label>
                    <textarea
                      className="input font-mono text-xs leading-relaxed min-h-[180px] bg-foreground-950 text-background-200"
                      value={cssCode}
                      onChange={(e) => {
                        setCssCode(e.target.value);
                        autoGenerateSteps(htmlCode, e.target.value, jsCode);
                      }}
                      placeholder=".my-effect { transition: all 0.3s ease; }"
                      required
                      spellCheck={false}
                    />
                  </div>
                )}

                {activeTab === 'js' && (
                  <div>
                    <label className="label">JavaScript (Optional)</label>
                    <textarea
                      className="input font-mono text-xs leading-relaxed min-h-[180px] bg-foreground-950 text-background-200"
                      value={jsCode}
                      onChange={(e) => {
                        setJsCode(e.target.value);
                        autoGenerateSteps(htmlCode, cssCode, e.target.value);
                      }}
                      placeholder="document.querySelector('.my-effect').addEventListener('mousemove', ...);"
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>

              {/* Card 3: Step-by-Step Guide Builder */}
              <div className="rounded-2xl border border-background-300/50 bg-background-50 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground-950 flex items-center gap-2">
                      <i className="ri-list-ordered text-primary-500" /> 3. Step-by-Step "How to Use" Guide
                    </h3>
                    <p className="text-xs text-foreground-500">Provide clear steps for developers integrating your effect.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => autoGenerateSteps(htmlCode, cssCode, jsCode)}
                    className="chip text-[11px] hover:border-primary-500"
                  >
                    <i className="ri-sparkling-2-line text-primary-500" /> Auto-Sync
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  {customSteps.map((step, idx) => (
                    <div key={idx} className="rounded-xl border border-background-300/60 bg-background-100/50 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-foreground-900 flex items-center gap-1.5">
                          <span className="grid h-5 w-5 place-items-center rounded bg-foreground-950 text-[10px] text-background-50">{idx + 1}</span>
                          Step {idx + 1}
                        </span>
                        {customSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(idx)}
                            className="text-xs text-primary-500 hover:text-primary-700"
                          >
                            <i className="ri-delete-bin-line" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-500 mb-1 block">Title</label>
                          <input
                            className="input py-2 text-xs"
                            value={step.title}
                            onChange={(e) => updateStepField(idx, 'title', e.target.value)}
                            placeholder="e.g. HTML Structure"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-500 mb-1 block">Language</label>
                          <select
                            className="input py-2 text-xs cursor-pointer"
                            value={step.lang}
                            onChange={(e) => updateStepField(idx, 'lang', e.target.value)}
                          >
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="js">JavaScript</option>
                            <option value="bash">Terminal / Bash</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-500 mb-1 block">Description</label>
                        <input
                          className="input py-2 text-xs"
                          value={step.desc}
                          onChange={(e) => updateStepField(idx, 'desc', e.target.value)}
                          placeholder="Brief instructions for this step..."
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-500 mb-1 block">Code Snippet</label>
                        <textarea
                          className="input font-mono text-xs min-h-[70px] bg-foreground-950 text-background-200"
                          value={step.code}
                          onChange={(e) => updateStepField(idx, 'code', e.target.value)}
                          placeholder="Code snippet for this step..."
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addStep}
                    className="btn btn-secondary h-9 w-full text-xs font-semibold border-dashed"
                  >
                    <i className="ri-add-line text-sm" /> Add Another Step
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary h-12 w-full text-sm font-semibold shadow-lg uppercase tracking-wider"
              >
                {loading ? <i className="ri-loader-4-line animate-spin text-lg" /> : <i className="ri-upload-cloud-line text-lg" />}
                Publish Effect to Library
              </button>
            </div>

            {/* Right: Real-time Live Sandbox Preview */}
            <div className="lg:sticky lg:top-28 space-y-4 min-w-0 w-full h-fit">
              <div className="overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-xl">
                {/* Live Preview Bar */}
                <div className="flex items-center justify-between border-b border-background-300/50 bg-background-100/70 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground-950 uppercase tracking-wider">Live Sandbox Preview</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Viewport size toggles */}
                    <div className="flex items-center rounded-lg bg-background-200/80 p-0.5">
                      <button
                        type="button"
                        onClick={() => setDeviceView('desktop')}
                        title="Desktop View"
                        className={`grid h-6 w-6 place-items-center rounded text-xs transition-colors ${
                          deviceView === 'desktop' ? 'bg-background-50 text-foreground-950 shadow-sm' : 'text-foreground-500'
                        }`}
                      >
                        <i className="ri-macbook-line" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeviceView('tablet')}
                        title="Tablet View"
                        className={`grid h-6 w-6 place-items-center rounded text-xs transition-colors ${
                          deviceView === 'tablet' ? 'bg-background-50 text-foreground-950 shadow-sm' : 'text-foreground-500'
                        }`}
                      >
                        <i className="ri-tablet-line" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeviceView('mobile')}
                        title="Mobile View"
                        className={`grid h-6 w-6 place-items-center rounded text-xs transition-colors ${
                          deviceView === 'mobile' ? 'bg-background-50 text-foreground-950 shadow-sm' : 'text-foreground-500'
                        }`}
                      >
                        <i className="ri-smartphone-line" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDark(!previewDark)}
                      className="chip text-[11px] bg-background-50"
                    >
                      <i className={previewDark ? 'ri-sun-line text-amber-500' : 'ri-moon-line'} />
                      {previewDark ? 'Dark' : 'Light'}
                    </button>
                  </div>
                </div>

                {/* Sandbox Stage */}
                <div className="relative flex items-center justify-center p-4 bg-background-200/30 min-h-[380px] overflow-hidden">
                  <div
                    className={`transition-all duration-300 rounded-xl overflow-hidden shadow-md ${
                      deviceView === 'mobile'
                        ? 'w-[320px] h-[380px]'
                        : deviceView === 'tablet'
                        ? 'w-[480px] h-[400px]'
                        : 'w-full h-[400px]'
                    }`}
                  >
                    <iframe
                      title="Studio Live Sandbox"
                      srcDoc={iframeSrcDoc}
                      className="h-full w-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>

                {/* Preview Info Footer */}
                <div className="border-t border-background-300/40 p-4 bg-background-50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground-950">{name}</span>
                    <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-600">
                      {category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-500 line-clamp-1">{description}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
