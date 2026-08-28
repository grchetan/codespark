-- =====================================================================
-- CodeSpark Official Supabase PostgreSQL Schema & Seed Migration
-- Project: CodeSpark (Live Interactive UI Effects & Components Library)
-- Founder & Lead Architect: Chetan Prajapat
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Public Users Profiles Table (Linked with Supabase Auth or Standalone)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'pending')),
  avatar TEXT,
  bio TEXT,
  effects_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Effects Table
CREATE TABLE IF NOT EXISTS public.effects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT DEFAULT '',
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  license TEXT DEFAULT 'MIT',
  likes INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  html_code TEXT NOT NULL,
  css_code TEXT NOT NULL,
  js_code TEXT DEFAULT '',
  instructions TEXT DEFAULT 'Follow step instructions below.',
  steps JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'medium',
  description TEXT DEFAULT '',
  html_code TEXT NOT NULL,
  css_code TEXT NOT NULL,
  js_code TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Roadmap / Requirements Table
CREATE TABLE IF NOT EXISTS public.requirements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'feature' CHECK (type IN ('feature', 'content', 'bug', 'design')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'done')),
  votes INTEGER DEFAULT 1,
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved'))
);

-- 7. Create Newsletter Table
CREATE TABLE IF NOT EXISTS public.newsletter (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create User Interactions Table (Likes / Saves)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  user_id TEXT NOT NULL,
  effect_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'save')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, effect_id, type)
);

-- =====================================================================
-- SEED INITIAL DATA (Founder & Super Admin: Chetan Prajapat + 18 Effects)
-- =====================================================================

INSERT INTO public.users (id, name, email, role, status, avatar, bio, effects_count, created_at)
VALUES 
  ('u_chetan', 'Chetan Prajapat', 'chetan@codespark.dev', 'admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'CodeSpark Platform Founder & Lead Architect', 18, NOW()),
  ('u_admin_codespark', 'Chetan Prajapat', 'admin@codespark.dev', 'admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'CodeSpark Platform Founder & Lead Architect', 18, NOW()),
  ('c1', 'Mara Voss', 'mara@codespark.dev', 'member', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'Pushing pixels and easing curves.', 32, NOW()),
  ('c2', 'Kenji Sato', 'kenji@codespark.dev', 'member', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', 'I build tiny interactions that make big interfaces feel alive.', 21, NOW())
ON CONFLICT (email) DO NOTHING;

-- Initial Submissions Seed
INSERT INTO public.submissions (id, name, category, author_name, author_email, tags, difficulty, status, submitted_at, html_code, css_code)
VALUES
  ('s_1', 'Cyberpunk Glitch Neon', 'Creative', 'Community Member', 'dev@community.io', '["glitch", "neon", "cyberpunk"]'::jsonb, 'medium', 'approved', NOW(), '<button class="cyber-btn"><span>CYBERPUNK</span></button>', '.cyber-btn { padding: 14px 28px; background: #FF4D2E; color: #fff; border: 2px solid #00F0FF; font-weight: 800; cursor: pointer; }'),
  ('s_2', 'Glow Border Hover', 'Hover', 'Aarav Sharma', 'aarav@codespark.dev', '["hover", "border", "glow"]'::jsonb, 'easy', 'pending', NOW(), '<button class="glow-border">Glow Button</button>', '.glow-border { border: 2px solid #FF4D2E; padding: 12px 24px; color: #fff; background: transparent; }')
ON CONFLICT (id) DO NOTHING;

-- Initial Requirements Seed
INSERT INTO public.requirements (id, title, description, type, priority, status, votes, requested_by, requested_at)
VALUES
  ('r_1', 'Dark mode toggle', 'Allow users to switch between light and dark theme across the whole library.', 'feature', 'high', 'open', 128, 'Kabir Singh', NOW()),
  ('r_2', 'Direct Live Preview cards without images', 'Render interactive live sandboxes directly in catalog cards.', 'feature', 'high', 'done', 89, 'Chetan Prajapat', NOW())
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) & Public Read Access
ALTER TABLE public.effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Policies
CREATE POLICY "Public Read Effects" ON public.effects FOR SELECT USING (true);
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Read Requirements" ON public.requirements FOR SELECT USING (true);
CREATE POLICY "Public Insert Submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Newsletter" ON public.newsletter FOR INSERT WITH CHECK (true);
