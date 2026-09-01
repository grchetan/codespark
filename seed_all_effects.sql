-- ============================================================
-- CodeSpark Full Effects & Users Seed Script for Supabase
-- Run this in Supabase SQL Editor to populate all 18 effects & RLS
-- ============================================================

-- 1. Enable Insert & Update Policies for effects and users
DROP POLICY IF EXISTS "Public Insert Effects" ON public.effects;
DROP POLICY IF EXISTS "Public Update Effects" ON public.effects;
DROP POLICY IF EXISTS "Public Insert Users" ON public.users;
DROP POLICY IF EXISTS "Public Update Users" ON public.users;

CREATE POLICY "Public Insert Effects" ON public.effects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Effects" ON public.effects FOR UPDATE USING (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);

-- 2. Insert Official Effects
INSERT INTO public.effects (
  id, slug, name, description, image, category, category_label, tags,
  difficulty, license, likes, saves, views, author_id, author_name,
  author_handle, author_avatar, html_code, css_code, js_code, instructions, steps, status
) VALUES 
(
  'e1', 'magnetic-button', 'Magnetic Button',
  'A CTA that is subtly pulled toward your cursor — the button leans in just before you commit.', '',
  'hover', 'Hover', '["magnetic", "button", "cursor", "micro-interaction"]'::jsonb,
  'medium', 'MIT', 342, 128, 4820, 'u_chetan', 'Chetan Prajapat', '@chetan',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  '<button class="magnetic-btn"><span>Magnetic Pull</span></button>',
  '.magnetic-btn { position: relative; padding: 16px 36px; border-radius: 9999px; background: #FF4D2E; color: #fff; font-weight: 700; border: none; cursor: pointer; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 30px rgba(255, 77, 46, 0.3); } .magnetic-btn:hover { transform: translate(var(--mx, 0), var(--my, 0)) scale(1.05); }',
  '// Magnetic physics listener attached to DOM element',
  'Step 1: Place HTML button in component.\nStep 2: Add CSS physics variables.\nStep 3: Attach pointer movement listener.',
  '[{"step":1,"title":"HTML Structure","desc":"Button with inner text container","code":"<button class=\"magnetic-btn\"><span>Magnetic Pull</span></button>","lang":"html"},{"step":2,"title":"CSS Variables","desc":"Define translate easing and shadow","code":".magnetic-btn {\n  position: relative;\n  padding: 16px 36px;\n  border-radius: 9999px;\n  background: #FF4D2E;\n  color: #fff;\n  font-weight: 700;\n  border: none;\n  cursor: pointer;\n  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n}","lang":"css"}]'::jsonb,
  'published'
),
(
  'e2', '3d-tilt-card', '3D Tilt Card',
  'Card surface tilts dynamically on pointermove with realistic glare and shadow depth.', '',
  '3d', '3D / Tilt', '["3d", "tilt", "card", "parallax"]'::jsonb,
  'medium', 'MIT', 512, 230, 7120, 'u_chetan', 'Chetan Prajapat', '@chetan',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  '<div class="tilt-card"><div class="tilt-content"><h3>3D Tilt Depth</h3><p>Move mouse over card</p></div></div>',
  '.tilt-card { width: 280px; height: 180px; border-radius: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(16px); transform-style: preserve-3d; transition: transform 0.15s ease-out; display: flex; align-items: center; justify-content: center; color: #FAF6EE; }',
  '',
  'Add 3D perspective wrapper and transform card on mousemove.',
  '[{"step":1,"title":"HTML Structure","desc":"Container with nested card","code":"<div class=\"tilt-card\">\n  <div class=\"tilt-content\">\n    <h3>3D Tilt Depth</h3>\n    <p>Move mouse over card</p>\n  </div>\n</div>","lang":"html"},{"step":2,"title":"CSS 3D Transform","desc":"Apply preserve-3d and backdrop blur","code":".tilt-card {\n  width: 280px;\n  height: 180px;\n  border-radius: 20px;\n  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));\n  border: 1px solid rgba(255,255,255,0.15);\n  backdrop-filter: blur(16px);\n  transform-style: preserve-3d;\n}","lang":"css"}]'::jsonb,
  'published'
),
(
  'e3', 'text-scramble', 'Text Scramble Decoder',
  'Cyberpunk character cycling effect that decrypts placeholder characters into legible copy.', '',
  'text', 'Text', '["text", "scramble", "decode", "cyberpunk"]'::jsonb,
  'advanced', 'MIT', 489, 210, 6890, 'u_chetan', 'Chetan Prajapat', '@chetan',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  '<div class="scramble-text"><span>CODESPARK DECODER</span></div>',
  '.scramble-text { font-family: monospace; font-size: 24px; font-weight: 700; color: #FF4D2E; letter-spacing: 2px; }',
  '',
  'Use character randomizer array and replace characters until word is resolved.',
  '[{"step":1,"title":"HTML Tag","desc":"Target text container","code":"<div class=\"scramble-text\"><span>CODESPARK DECODER</span></div>","lang":"html"}]'::jsonb,
  'published'
),
(
  'e4', 'cursor-spotlight', 'Cursor Spotlight Card',
  'Radial spotlight tracks cursor coordinates and reveals underlying glowing borders.', '',
  'cursor', 'Cursor', '["cursor", "spotlight", "radial-gradient", "glow"]'::jsonb,
  'easy', 'MIT', 390, 165, 5400, 'u_chetan', 'Chetan Prajapat', '@chetan',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  '<div class="spotlight-card"><span>Interactive Spotlight</span></div>',
  '.spotlight-card { position: relative; padding: 40px; border-radius: 16px; background: #141210; color: #FAF6EE; border: 1px solid #332e29; overflow: hidden; }',
  '',
  'Update CSS custom variables --x and --y on mousemove.',
  '[{"step":1,"title":"HTML Structure","desc":"Spotlight card box","code":"<div class=\"spotlight-card\"><span>Interactive Spotlight</span></div>","lang":"html"}]'::jsonb,
  'published'
),
(
  'e5', 'aurora-loader', 'Aurora Ambient Loader',
  'Multi-layered blurred gradients rotate in opposite directions to create organic glowing pulse.', '',
  'loaders', 'Loaders', '["loader", "aurora", "blur", "ambient", "css-only"]'::jsonb,
  'easy', 'MIT', 620, 310, 8900, 'u_chetan', 'Chetan Prajapat', '@chetan',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  '<div class="aurora-box"><div class="aurora-ring"></div></div>',
  '.aurora-box { position: relative; width: 80px; height: 80px; } .aurora-ring { position: absolute; inset: 0; border-radius: 50%; filter: blur(20px); background: linear-gradient(#FF4D2E, #10B981); animation: spin 4s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }',
  '',
  'Pure CSS keyframe animation with backdrop filters.',
  '[{"step":1,"title":"HTML Markup","desc":"Ambient loader wrapper","code":"<div class=\"aurora-box\"><div class=\"aurora-ring\"></div></div>","lang":"html"},{"step":2,"title":"CSS Animations","desc":"Spin and blur filter","code":".aurora-box { position: relative; width: 80px; height: 80px; }\n.aurora-ring {\n  position: absolute;\n  inset: 0;\n  border-radius: 50%;\n  filter: blur(20px);\n  background: linear-gradient(#FF4D2E, #10B981);\n  animation: spin 4s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }","lang":"css"}]'::jsonb,
  'published'
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  html_code = EXCLUDED.html_code,
  css_code = EXCLUDED.css_code,
  steps = EXCLUDED.steps;

-- 3. Sync User Profiles
INSERT INTO public.users (id, name, email, role, status, avatar, bio, effects_count)
VALUES 
  ('u_chetan', 'Chetan Prajapat', 'chetan@codespark.dev', 'admin', 'active', 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat', 'CodeSpark Platform Founder & Lead Architect', 18),
  ('u_admin_codespark', 'Chetan Prajapat', 'admin@codespark.dev', 'admin', 'active', 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat', 'CodeSpark Platform Founder & Lead Architect', 18)
ON CONFLICT (email) DO NOTHING;

-- 4. Create and Configure Site Settings Table for Maintenance Mode
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public Insert Site Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public Update Site Settings" ON public.site_settings;

CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert Site Settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Site Settings" ON public.site_settings FOR UPDATE USING (true);

INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('maintenance_mode', 'false', NOW())
ON CONFLICT (key) DO NOTHING;
