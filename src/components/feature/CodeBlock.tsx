import { useState, useMemo } from 'react';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, lang: 'html' | 'css' | 'js' | 'bash'): string {
  const escaped = escapeHtml(code);

  if (lang === 'html') {
    return escaped
      .replace(/(&lt;\/?)([\w-]+)/g, '<span class="html-tag">$1$2</span>')
      .replace(/([\w-]+)(=)/g, '<span class="html-attr">$1</span><span class="html-punct">$2</span>')
      .replace(/(&quot;.*?&quot;)/g, '<span class="html-string">$1</span>')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span class="html-comment">$1</span>');
  }

  if (lang === 'css') {
    return escaped
      .replace(/(\.[\w-]+|#[\w-]+)/g, '<span class="css-selector">$1</span>')
      .replace(/([\w-]+)(\s*:)/g, '<span class="css-prop">$1</span><span class="css-punct">$2</span>')
      .replace(/(:\s*)([^;]+)/g, '<span class="css-punct">$1</span><span class="css-val">$2</span>')
      .replace(/(\/\*.*?\*\/)/g, '<span class="css-comment">$1</span>');
  }

  if (lang === 'js') {
    return escaped
      .replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|default|try|catch|new|this|class|extends|import|export|from|async|await|typeof|instanceof)\b/g, '<span class="js-keyword">$1</span>')
      .replace(/(&quot;.*?&quot;|'.*?'|`.*?`)/g, '<span class="js-string">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="js-comment">$1</span>')
      .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="js-number">$1</span>')
      .replace(/\b(document|window|console|Math|Date|Array|Object|String|Number|Boolean|Promise|setTimeout|setInterval|addEventListener|querySelector|getElementById|createElement|appendChild|removeChild|classList|style|innerHTML|textContent)\b/g, '<span class="js-builtin">$1</span>');
  }

  if (lang === 'bash') {
    return escaped
      .replace(/\b(npm|yarn|pnpm|npx|git|install|run|build|dev|add)\b/g, '<span class="js-keyword">$1</span>')
      .replace(/(-{1,2}[\w-]+)/g, '<span class="html-attr">$1</span>');
  }

  return escaped;
}

const fileNames: Record<string, string> = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
  bash: 'terminal',
};

const langColors: Record<string, string> = {
  html: '#ff6b35',
  css: '#4285f4',
  js: '#f7df1e',
  bash: '#10b981',
};

export default function CodeBlock({ code, lang }: { code: string; lang: 'html' | 'css' | 'js' | 'bash' }) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(() => highlightCode(code, lang), [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-background-300/50 bg-[#0f1115] shadow-lg">
      {/* macOS-style window header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-xs font-mono text-white/40">{fileNames[lang] || 'snippet'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: langColors[lang] || '#ff4d2e' }}
          />
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
            {lang}
          </span>
          <button
            type="button"
            onClick={copy}
            className="ml-3 flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
          >
            <i className={copied ? 'ri-check-line text-green-400' : 'ri-file-copy-line'} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code area with line numbers */}
      <div className="flex overflow-auto">
        {/* Line numbers */}
        <div className="shrink-0 select-none border-r border-white/5 py-4 pr-3 pl-4 text-right font-mono text-[12px] leading-[1.7] text-white/20">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        {/* Code */}
        <pre className="code-scroll flex-1 overflow-auto p-4 font-mono text-[13px] leading-[1.7] text-white/80">
          <code
            className="block min-w-max"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>

      <style>{`
        .html-tag { color: #ff6b35; }
        .html-attr { color: #e2a8f0; }
        .html-string { color: #a5d6a7; }
        .html-comment { color: #6a7a8a; }
        .html-punct { color: #89a0b5; }
        .css-selector { color: #ff8a65; }
        .css-prop { color: #81d4fa; }
        .css-val { color: #a5d6a7; }
        .css-punct { color: #89a0b5; }
        .css-comment { color: #6a7a8a; }
        .js-keyword { color: #c792ea; }
        .js-string { color: #c3e88d; }
        .js-comment { color: #6a7a8a; }
        .js-number { color: #f78c6c; }
        .js-builtin { color: #82aaff; }
      `}</style>
    </div>
  );
}