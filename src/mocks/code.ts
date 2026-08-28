export interface CodeBlock {
  html: string;
  css: string;
  js?: string;
}

export const effectCode: Record<string, CodeBlock> = {
  e1: {
    html: `<button class="magnetic">Magnetic CTA</button>`,
    css: `.magnetic {
  padding: 14px 28px;
  border: none;
  border-radius: 6px;
  background: var(--brand);
  color: #0c0b0a;
  font-weight: 600;
  cursor: pointer;
  transition: transform .5s cubic-bezier(.16,1,.3,1);
}`,
    js: `const btn = document.querySelector('.magnetic');
btn.addEventListener('mousemove', (e) => {
  const r = btn.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) * 0.3;
  const y = (e.clientY - r.top - r.height / 2) * 0.3;
  btn.style.transform = \`translate(\${x}px, \${y}px)\`;
});
btn.addEventListener('mouseleave', () => {
  btn.style.transform = 'translate(0, 0)';
});`,
  },
  e2: {
    html: `<div class="tilt">
  <div class="tilt__inner">
    <h3>3D Card</h3>
    <p>Perspective, depth, glare.</p>
  </div>
</div>`,
    css: `.tilt { perspective: 800px; }
.tilt__inner {
  transform-style: preserve-3d;
  transition: transform .6s cubic-bezier(.16,1,.3,1);
  border-radius: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #1d1a16, rgba(255,107,53,.25));
}`,
    js: `const card = document.querySelector('.tilt__inner');
card.addEventListener('mousemove', (e) => {
  const r = card.getBoundingClientRect();
  const rx = ((e.clientY - r.top) / r.height - 0.5) * -16;
  const ry = ((e.clientX - r.left) / r.width - 0.5) * 16;
  card.style.transform = \`rotateX(\${rx}deg) rotateY(\${ry}deg)\`;
});`,
  },
  e3: {
    html: `<h1 class="scramble">SCRAMBLE</h1>`,
    css: `.scramble {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--brand);
}`,
    js: `const el = document.querySelector('.scramble');
const chars = '!<>-_\\\\/[]—=+*^?#';
const target = el.textContent;
const total = 24;
let frame = 0;
const tick = () => {
  frame++;
  let out = '';
  for (let i = 0; i < target.length; i++) {
    out += target[i] && Math.random() < (frame / total) * 0.8
      ? target[i]
      : chars[Math.floor(Math.random() * chars.length)];
  }
  el.textContent = out;
  if (frame < total) requestAnimationFrame(tick);
  else el.textContent = target;
};
requestAnimationFrame(tick);`,
  },
  e4: {
    html: `<section class="spotlight">
  <h2>Move the cursor across this line</h2>
  <div class="spotlight__overlay"></div>
</section>`,
    css: `.spotlight { position: relative; overflow: hidden; }
.spotlight__overlay {
  position: absolute; inset: 0;
  background: rgba(12,11,10,.94);
  transition: background .2s ease-out;
}
.spotlight:hover .spotlight__overlay {
  background: radial-gradient(120px circle at var(--mx) var(--my), transparent 10%, rgba(12,11,10,.94) 60%);
}`,
    js: `const sec = document.querySelector('.spotlight');
sec.addEventListener('mousemove', (e) => {
  const r = sec.getBoundingClientRect();
  sec.style.setProperty('--mx', e.clientX - r.left + 'px');
  sec.style.setProperty('--my', e.clientY - r.top + 'px');
});`,
  },
  e5: {
    html: `<div class="aurora"><span></span><span></span><span></span></div>`,
    css: `.aurora {
  position: relative; width: 96px; height: 96px;
  display: grid; place-items: center;
}
.aurora span { position: absolute; border-radius: 50%; filter: blur(8px); animation: spin 14s linear infinite; }
.aurora span:nth-child(1){ inset: 0; background: var(--brand); opacity: .8; }
.aurora span:nth-child(2){ inset: 14px; background: var(--acid); animation-direction: reverse; }
.aurora span:nth-child(3){ width: 12px; height: 12px; background: #fff; z-index: 2; }
@keyframes spin { to { transform: rotate(360deg); } }`,
  },
  e6: {
    html: `<div class="marquee">
  <div class="marquee__track">
    <span>Preview the effect in motion</span>
    <span>Preview the effect in motion</span>
  </div>
</div>`,
    css: `.marquee { overflow: hidden; }
.marquee__track {
  display: flex; gap: 24px; width: max-content;
  animation: scroll 26s linear infinite;
}
.marquee__track span {
  background: linear-gradient(90deg, var(--brand), var(--acid), var(--brand));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700; text-transform: uppercase;
}
@keyframes scroll { to { transform: translateX(-50%); } }`,
  },
  e7: {
    html: `<button class="ripple">Click me</button>`,
    css: `.ripple {
  position: relative; overflow: hidden;
  padding: 12px 24px; border: none; border-radius: 6px;
  background: var(--brand); color: #0c0b0a; cursor: pointer;
}
.ripple span {
  position: absolute; border-radius: 50%;
  background: rgba(12,11,10,.35);
  transform: scale(0); animation: ripple .7s ease-out forwards;
  pointer-events: none;
}
@keyframes ripple { to { transform: scale(1); opacity: 0; } }`,
    js: `const btn = document.querySelector('.ripple');
btn.addEventListener('click', (e) => {
  const r = btn.getBoundingClientRect();
  const d = Math.max(r.width, r.height) * 2;
  const span = document.createElement('span');
  span.style.width = span.style.height = d + 'px';
  span.style.left = e.clientX - r.left - d / 2 + 'px';
  span.style.top = e.clientY - r.top - d / 2 + 'px';
  btn.appendChild(span);
  setTimeout(() => span.remove(), 700);
});`,
  },
  e8: {
    html: `<div class="spot-card">
  <div class="spot-card__glow"></div>
  <p>Spotlight follows your cursor</p>
</div>`,
    css: `.spot-card { position: relative; overflow: hidden; padding: 24px; border-radius: 8px; background: #14120f; }
.spot-card__glow {
  position: absolute; inset: 0; opacity: 0;
  background: radial-gradient(160px circle at var(--mx) var(--my), rgba(255,107,53,.35), transparent 70%);
  transition: opacity .3s ease;
}
.spot-card:hover .spot-card__glow { opacity: 1; }`,
    js: `const card = document.querySelector('.spot-card');
card.addEventListener('mousemove', (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', e.clientX - r.left + 'px');
  card.style.setProperty('--my', e.clientY - r.top + 'px');
});`,
  },
  e9: {
    html: `<div class="blob"></div>`,
    css: `.blob {
  width: 112px; height: 112px;
  background: linear-gradient(135deg, var(--brand), var(--acid));
  filter: blur(2px);
  animation: morph 7s ease-in-out infinite;
}
@keyframes morph {
  0%,100% { border-radius: 62% 38% 54% 46% / 55% 48% 52% 45%; transform: rotate(0) scale(1); }
  33% { border-radius: 35% 65% 58% 42% / 63% 38% 62% 37%; transform: rotate(60deg) scale(1.08); }
  66% { border-radius: 70% 30% 42% 58% / 40% 60% 40% 60%; transform: rotate(120deg) scale(.96); }
}`,
  },
  e10: {
    html: `<main class="page page--a">Page A</main>
<main class="page page--b">Page B</main>`,
    css: `.page { position: fixed; inset: 0; display: grid; place-items: center; font-size: 2rem; }
.page--a { clip-path: inset(0 0 100% 0); background: linear-gradient(135deg, var(--brand), var(--acid)); }
.page--b { clip-path: inset(0 0 0 0); transition: clip-path .7s cubic-bezier(.77,0,.18,1); }
.page--a.active { clip-path: inset(0 0 0 0); }
.page--b.active { clip-path: inset(0 0 100% 0); }`,
    js: `// Wire to your router. On navigation:
const next = document.querySelector('.page--b');
next.classList.toggle('active');`,
  },
  e11: {
    html: `<div class="stack">
  <div class="stack__card">A</div>
  <div class="stack__card">B</div>
  <div class="stack__card">C</div>
</div>`,
    css: `.stack__card {
  padding: 24px; border-radius: 8px; width: 180px;
  background: rgba(20,18,15,.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.08);
  transition: transform .35s cubic-bezier(.16,1,.3,1);
}
.stack__card:nth-child(2){ transform: translate(8px, 8px); }
.stack__card:nth-child(3){ transform: translate(16px, 16px); }
.stack:hover .stack__card { transform: translate(0, 0); }`,
  },
  e12: {
    html: `<span class="shimmer">CODESPARK</span>`,
    css: `.shimmer {
  font-weight: 700; font-size: 3rem;
  background: linear-gradient(90deg, #948a79, #f6f0e3, #948a79);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shine 2.4s linear infinite;
}
@keyframes shine { to { background-position: -200% center; } }`,
  },
  e13: {
    html: `<div class="stage">
  <div class="follower"></div>
  <span>move around</span>
</div>`,
    css: `.follower {
  position: fixed; width: 8px; height: 8px; border-radius: 50%;
  background: var(--text); pointer-events: none;
  transition: all .12s ease-out;
}
.follower::after {
  content: ""; position: absolute; inset: -12px;
  border: 1px solid var(--brand); border-radius: 50%;
  transition: all .35s cubic-bezier(.16,1,.3,1);
}`,
    js: `const dot = document.querySelector('.follower');
document.addEventListener('mousemove', (e) => {
  dot.style.left = e.clientX + 'px';
  dot.style.top = e.clientY + 'px';
});`,
  },
  e14: {
    html: `<div class="skel">
  <div class="skel__title"></div>
  <div class="skel__line"></div>
  <div class="skel__avatar"></div>
</div>`,
    css: `.skel__title, .skel__line, .skel__avatar {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
  background-color: rgba(255,255,255,.06);
  background-size: 200% 100%;
  animation: sk 1.6s linear infinite;
}
.skel__title { height: 8px; width: 40%; border-radius: 6px; }
.skel__line { height: 12px; border-radius: 6px; }
.skel__avatar { height: 40px; width: 40px; border-radius: 50%; }
@keyframes sk { to { background-position: -200% 0; } }`,
  },
  e15: {
    html: `<div class="scene">
  <div class="layer" data-z="-50"></div>
  <div class="layer" data-z="0"></div>
  <div class="layer" data-z="60"></div>
</div>`,
    css: `.scene { perspective: 900px; }
.layer { position: absolute; inset: 0; border-radius: 8px;
  transition: transform .6s cubic-bezier(.16,1,.3,1);
  transform-style: preserve-3d;
}`,
    js: `const scene = document.querySelector('.scene');
scene.addEventListener('mousemove', (e) => {
  const r = scene.getBoundingClientRect();
  const rx = ((e.clientY - r.top) / r.height - 0.5) * 18;
  const ry = ((e.clientX - r.left) / r.width - 0.5) * 18;
  scene.style.transform = \`rotateX(\${rx}deg) rotateY(\${ry}deg)\`;
  scene.querySelectorAll('.layer').forEach((el) => {
    el.style.transform = \`translateZ(\${el.dataset.z}px)\`;
  });
});`,
  },
  e16: {
    html: `<nav class="magnetic-nav">
  <a href="#">Home</a>
  <a href="#">Effects</a>
  <a href="#">Community</a>
</nav>`,
    css: `.magnetic-nav a {
  display: inline-block; padding: 6px 14px; border-radius: 999px;
  color: var(--text-soft); transition: all .2s ease;
}
.magnetic-nav a:hover { background: var(--panel); color: var(--text); }`,
    js: `const links = document.querySelectorAll('.magnetic-nav a');
links.forEach((link) => {
  link.addEventListener('mousemove', (e) => {
    const r = link.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.3;
    link.style.transform = \`translateX(\${x}px)\`;
  });
  link.addEventListener('mouseleave', () => link.style.transform = 'none');
});`,
  },
};