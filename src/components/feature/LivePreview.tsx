import { useMemo } from 'react';
import CssDemos from './previews/CssDemos';
import MouseDemos from './previews/MouseDemos';

const mouseIds = ['e1', 'e2', 'e3', 'e4', 'e8', 'e10', 'e13', 'e15', 'e16'];
const cssIds = ['e5', 'e6', 'e7', 'e9', 'e11', 'e12', 'e14'];

interface LivePreviewProps {
  id?: string;
  interactive?: boolean;
  html?: string;
  css?: string;
  js?: string;
  darkStage?: boolean;
  className?: string;
  customText?: string;
  customSubText?: string;
  customColor?: string;
}

function hexToRgba(hex: string, alpha = 0.3): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function LivePreview({
  id = '',
  interactive = true,
  html,
  css,
  js,
  darkStage = false,
  className = '',
  customText,
  customSubText,
  customColor = '#FF4D2E'
}: LivePreviewProps) {
  const hasCustomCode = Boolean(html && css);
  const isBuiltIn = mouseIds.includes(id) || cssIds.includes(id);
  const renderCustom = hasCustomCode && (!isBuiltIn || id.startsWith('e_'));

  const customSrcDoc = useMemo(() => {
    if (!html && !css) return '';
    const bg = darkStage ? '#141210' : '#FAF6EE';
    const text = darkStage ? '#FAF6EE' : '#0F1115';

    // Apply custom text and color replacement to HTML & CSS if provided
    let processedHtml = html || '';
    let processedCss = css || '';

    if (customText && customText.trim()) {
      processedHtml = processedHtml.replace(/(<(h1|h2|h3|h4|button|span|a)[^>]*>)(.*?)(<\/\2>)/i, (m, open, tag, inner, close) => {
        return `${open}${customText}${close}`;
      });
    }

    if (customSubText && customSubText.trim()) {
      processedHtml = processedHtml.replace(/(<p[^>]*>)(.*?)(<\/p>)/i, `$1${customSubText}$3`);
    }

    if (customColor && customColor.toLowerCase() !== '#ff4d2e') {
      processedCss = processedCss
        .replace(/#ff4d2e/gi, customColor)
        .replace(/#ff6b35/gi, customColor)
        .replace(/rgba\(255,\s*77,\s*46,\s*[\d.]+\)/gi, hexToRgba(customColor, 0.4));
    }

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
      background-color: ${bg};
      color: ${text};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      user-select: none;
    }
    ${processedCss}
  </style>
</head>
<body>
  ${processedHtml || '<div style="font-size:12px;color:#7e6c60">Live Preview Sandbox</div>'}
  <script>
    try {
      ${js || ''}
    } catch (err) {
      console.warn('CodeSpark Sandbox error:', err);
    }
  </script>
</body>
</html>`;
  }, [html, css, js, darkStage, customText, customSubText, customColor]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden select-none transition-colors ${
        darkStage ? 'bg-background-950 text-background-50' : 'bg-background-100/70 text-foreground-950'
      } ${className}`}
    >
      {/* Background canvas grid dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: darkStage
            ? 'radial-gradient(rgba(250, 246, 238, 0.15) 1px, transparent 1px)'
            : 'radial-gradient(rgba(20, 18, 16, 0.12) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Live Stage Renderer */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {renderCustom ? (
          <iframe
            title="CodeSpark Live Effect Sandbox"
            srcDoc={customSrcDoc}
            className="h-full w-full border-0 pointer-events-auto"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        ) : isBuiltIn ? (
          interactive && mouseIds.includes(id) ? (
            <MouseDemos id={id} text={customText} subText={customSubText} color={customColor} />
          ) : (
            <CssDemos id={id} text={customText} color={customColor} />
          )
        ) : html || css ? (
          <iframe
            title="CodeSpark Live Effect Sandbox"
            srcDoc={customSrcDoc}
            className="h-full w-full border-0 pointer-events-auto"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-xs text-foreground-400">
            <i className="ri-sparkling-2-line text-lg" style={{ color: customColor }} />
            <span>Interactive Effect</span>
          </div>
        )}
      </div>
    </div>
  );
}