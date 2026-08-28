import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Effect } from '@/mocks/effects';
import LivePreview from './LivePreview';
import { effectCode } from '@/mocks/code';

export function formatCount(n: number) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

const difficultyColor: Record<string, string> = {
  easy: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
};

export default function EffectCard({
  effect,
  compact = false,
}: {
  effect: Effect;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(effect.likes || 0);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [darkStage, setDarkStage] = useState(false);

  // Retrieve code from effect object or fallback mock code
  const code = {
    html: effect.html_code || effectCode[effect.id]?.html || '',
    css: effect.css_code || effectCode[effect.id]?.css || '',
    js: effect.js_code || effectCode[effect.id]?.js || '',
  };

  const goDetail = () => navigate(`/effects/${effect.slug || effect.id}`);

  const onLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !liked;
    setLiked(nextState);
    setLikes((v) => (nextState ? v + 1 : Math.max(0, v - 1)));
    try {
      await fetch(`/api/effects/${effect.id}/like`, { method: 'POST' });
    } catch {
      // offline fallback
    }
  };

  const onSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((v) => !v);
    try {
      await fetch(`/api/effects/${effect.id}/save`, { method: 'POST' });
    } catch {
      // offline fallback
    }
  };

  const copyCode = async (e: React.MouseEvent, type: 'all' | 'html' | 'css' | 'js') => {
    e.stopPropagation();
    setShowCopyMenu(false);
    let textToCopy = '';
    if (type === 'html') textToCopy = code.html;
    else if (type === 'css') textToCopy = code.css;
    else if (type === 'js') textToCopy = code.js;
    else {
      textToCopy = [
        code.html ? `<!-- HTML -->\n${code.html}` : '',
        code.css ? `/* CSS */\n${code.css}` : '',
        code.js ? `// JavaScript\n${code.js}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    if (!textToCopy) {
      textToCopy = effect.description;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // noop
    }
  };

  const openRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/effects/${effect.slug || effect.id}?mode=customizer`);
  };

  return (
    <article
      onClick={goDetail}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-background-300/60 bg-background-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50 hover:shadow-xl cursor-pointer"
    >
      {/* Live Interactive Stage (100% Code-Driven, No Static Images!) */}
      <div
        className={`relative w-full overflow-hidden border-b border-background-300/40 transition-colors ${
          compact ? 'h-40' : 'h-52 sm:h-56'
        }`}
      >
        <LivePreview
          id={effect.id}
          html={code.html}
          css={code.css}
          js={code.js}
          darkStage={darkStage}
          className="h-full w-full"
        />

        {/* Floating Category Chip */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5">
          <span className="rounded-full bg-background-50/90 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-foreground-950 backdrop-blur-md border border-background-300/60 shadow-sm">
            {effect.categoryLabel}
          </span>
        </div>

        {/* Live Action Badges & Stage Controls */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            title="Toggle Light/Dark Canvas Stage"
            onClick={(e) => {
              e.stopPropagation();
              setDarkStage((v) => !v);
            }}
            className="grid h-7 w-7 place-items-center rounded-full bg-background-50/90 text-foreground-600 backdrop-blur-md border border-background-300/60 hover:text-foreground-950 transition-colors"
          >
            <i className={darkStage ? 'ri-sun-line text-xs text-amber-500' : 'ri-moon-line text-xs'} />
          </button>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 backdrop-blur-md border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        {/* Hover Cue Banner */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background-950/40 to-transparent px-3 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-[10px] font-mono uppercase tracking-wider text-background-50">
            <i className="ri-cursor-line mr-1 text-primary-400" /> Hover to test
          </span>
          <span className="text-[10px] font-medium text-primary-400">
            Open Details →
          </span>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 sm:p-5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-body text-sm sm:text-base font-bold text-foreground-950 group-hover:text-primary-500 transition-colors">
              {effect.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                difficultyColor[effect.difficulty] || 'text-foreground-500 border-background-300'
              }`}
            >
              {effect.difficulty}
            </span>
          </div>

          <p
            className={`mt-1.5 text-xs text-foreground-500 leading-relaxed ${
              compact ? 'line-clamp-1' : 'line-clamp-2'
            }`}
          >
            {effect.description}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {effect.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-md bg-background-200/60 px-2 py-0.5 text-[10px] font-medium text-foreground-600"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="mt-4 flex items-center justify-between border-t border-background-300/50 pt-3">
          {/* Official Verified Author Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-500 text-[10px] font-bold text-white shadow-sm shrink-0">
              ⚡
            </span>
            <span className="truncate text-xs font-semibold text-foreground-800 flex items-center gap-1">
              {effect.author?.name || 'CodeSpark Official'}
              <i className="ri-verified-badge-fill text-primary-500 text-xs shrink-0" title="Verified Official Component" />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 relative">
            {/* Live Text Customizer Shortcut */}
            <button
              type="button"
              onClick={openRemix}
              title="Test with your custom text & theme"
              className="grid h-8 w-8 place-items-center rounded-lg text-foreground-500 hover:bg-primary-50 hover:text-primary-500 transition-colors"
            >
              <i className="ri-palette-line text-base" />
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={onLike}
              aria-label="Like"
              className={`flex items-center gap-1 rounded-lg px-2 h-8 text-xs font-medium transition-colors hover:bg-background-200/50 ${
                liked ? 'text-primary-500 bg-primary-500/10' : 'text-foreground-500'
              }`}
            >
              <i className={liked ? 'ri-heart-fill text-base' : 'ri-heart-line text-base'} />
              <span>{formatCount(likes)}</span>
            </button>

            {/* Save / Bookmark */}
            <button
              type="button"
              onClick={onSave}
              aria-label="Save"
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-background-200/50 ${
                saved ? 'text-accent-600 bg-accent-500/10' : 'text-foreground-500'
              }`}
            >
              <i className={saved ? 'ri-bookmark-fill text-base' : 'ri-bookmark-line text-base'} />
            </button>

            {/* Copy Code Dropdown / Button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => copyCode(e, 'all')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCopyMenu((v) => !v);
                }}
                title="Click: Copy all code | Right-click: Choose format"
                className={`flex items-center gap-1 rounded-lg px-2.5 h-8 text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-background-50'
                    : 'bg-background-200/70 text-foreground-700 hover:bg-foreground-950 hover:text-background-50'
                }`}
              >
                {copied ? (
                  <>
                    <i className="ri-check-line text-sm" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <i className="ri-code-s-slash-line text-sm" />
                    <span>Code</span>
                  </>
                )}
              </button>

              {/* Copy Format Submenu */}
              {showCopyMenu && (
                <div
                  className="absolute bottom-10 right-0 z-30 w-36 rounded-xl border border-background-300/80 bg-background-50 p-1.5 shadow-xl backdrop-blur-xl animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, 'all')}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground-800 hover:bg-background-200"
                  >
                    <i className="ri-file-copy-line text-primary-500" /> Copy Bundle
                  </button>
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, 'html')}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground-800 hover:bg-background-200"
                  >
                    <i className="ri-html5-line text-orange-500" /> Copy HTML
                  </button>
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, 'css')}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground-800 hover:bg-background-200"
                  >
                    <i className="ri-css3-line text-blue-500" /> Copy CSS
                  </button>
                  {code.js && (
                    <button
                      type="button"
                      onClick={(e) => copyCode(e, 'js')}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground-800 hover:bg-background-200"
                    >
                      <i className="ri-javascript-line text-amber-500" /> Copy JS
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}