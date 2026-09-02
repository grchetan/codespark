-- ==============================================================================
-- CODESPARK ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) & ROW LEVEL SECURITY (RLS)
-- Master Architecture: Supabase Auth (auth.users) as Single Source of Truth
-- Platform Owner & Super Admin: Chetan Prajapat (chetanprajapat340@gmail.com)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Public Schema Tables Exist with Proper Types
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  avatar TEXT,
  bio TEXT,
  effects_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop legacy password fields from public.users if they exist
ALTER TABLE public.users DROP COLUMN IF EXISTS password;
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Ensure role and status constraints on public.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('superadmin', 'admin', 'moderator', 'member'));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE public.users 
  ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'banned', 'pending'));

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

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved'))
);

CREATE TABLE IF NOT EXISTS public.user_interactions (
  user_id TEXT NOT NULL,
  effect_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'save')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, effect_id, type)
);

-- ==============================================================================
-- 3. Security Definer Functions (Role Lookup via Cryptographic JWT / Auth UID)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'email',
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    public.get_auth_email() = 'chetanprajapat340@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = auth.uid()::text OR email = public.get_auth_email())
        AND role = 'superadmin'
        AND status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = auth.uid()::text OR email = public.get_auth_email())
        AND role IN ('superadmin', 'admin')
        AND status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean AS $$
BEGIN
  RETURN (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = auth.uid()::text OR email = public.get_auth_email())
        AND role IN ('superadmin', 'admin', 'moderator')
        AND status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 4. Automated User Profile Creation Trigger (auth.users -> public.users)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  user_display_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Determine role: only designated owner email receives superadmin automatically
  IF NEW.email = 'chetanprajapat340@gmail.com' THEN
    assigned_role := 'superadmin';
  ELSE
    assigned_role := 'member';
  END IF;

  user_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  user_avatar := COALESCE(
    NEW.raw_user_meta_data ->> 'avatar_url',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=' || user_display_name
  );

  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    status,
    avatar,
    effects_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::text,
    user_display_name,
    NEW.email,
    assigned_role,
    'active',
    user_avatar,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    id = NEW.id::text,
    updated_at = NOW()
  WHERE public.users.email <> 'chetanprajapat340@gmail.com';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. Unbreakable Root Super Admin & Role Protection Triggers
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protect_user_roles_trigger()
RETURNS trigger AS $$
BEGIN
  -- A. Protect the Super Admin account from demotion, banning, or deletion
  IF (OLD.email = 'chetanprajapat340@gmail.com' OR OLD.role = 'superadmin') THEN
    IF (TG_OP = 'DELETE') THEN
      RAISE EXCEPTION 'PERMISSION DENIED: The Super Admin / Platform Owner account cannot be deleted.';
    END IF;

    IF (NEW.role <> 'superadmin' OR NEW.status <> 'active') THEN
      RAISE EXCEPTION 'PERMISSION DENIED: The Super Admin / Platform Owner account cannot be demoted or banned.';
    END IF;
  END IF;

  -- B. Prevent unauthorized role elevation to 'admin' or 'superadmin'
  IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
    IF (NEW.role IN ('admin', 'superadmin') AND COALESCE(OLD.role, 'member') NOT IN ('admin', 'superadmin')) THEN
      IF NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'PERMISSION DENIED: Only the Super Admin / Platform Owner can appoint Admins.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_roles ON public.users;
CREATE TRIGGER trg_protect_user_roles
BEFORE UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_user_roles_trigger();

-- ==============================================================================
-- 6. Enable Row Level Security (RLS) on all Tables
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- 7. Users Table RLS Policies
DROP POLICY IF EXISTS "Public can view active users" ON public.users;
CREATE POLICY "Public can view active users" 
  ON public.users FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update their own non-role profile" ON public.users;
CREATE POLICY "Users can update their own non-role profile" 
  ON public.users FOR UPDATE 
  USING (id = auth.uid()::text OR email = public.get_auth_email())
  WITH CHECK (
    (id = auth.uid()::text OR email = public.get_auth_email())
    AND role = (SELECT role FROM public.users WHERE id = auth.uid()::text OR email = public.get_auth_email())
  );

DROP POLICY IF EXISTS "Admins can manage members and moderators" ON public.users;
CREATE POLICY "Admins can manage members and moderators" 
  ON public.users FOR ALL 
  USING (public.is_admin());

-- 8. Effects Table RLS Policies
DROP POLICY IF EXISTS "Public can view published effects" ON public.effects;
CREATE POLICY "Public can view published effects" 
  ON public.effects FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can insert and update effects" ON public.effects;
CREATE POLICY "Admins can insert and update effects" 
  ON public.effects FOR ALL 
  USING (public.is_admin());

-- 9. Submissions Table RLS Policies
DROP POLICY IF EXISTS "Public can insert submissions" ON public.submissions;
CREATE POLICY "Public can insert submissions" 
  ON public.submissions FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view submissions" ON public.submissions;
CREATE POLICY "Users can view submissions" 
  ON public.submissions FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Staff can manage submissions" ON public.submissions;
CREATE POLICY "Staff can manage submissions" 
  ON public.submissions FOR ALL 
  USING (public.is_moderator());

-- 10. Contact Messages & Requirements RLS Policies
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" 
  ON public.contact_messages FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage contact messages" ON public.contact_messages;
CREATE POLICY "Staff can manage contact messages" 
  ON public.contact_messages FOR ALL 
  USING (public.is_moderator());

DROP POLICY IF EXISTS "Public can view requirements" ON public.requirements;
CREATE POLICY "Public can view requirements" 
  ON public.requirements FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can manage requirements" ON public.requirements;
CREATE POLICY "Admins can manage requirements" 
  ON public.requirements FOR ALL 
  USING (public.is_admin());

-- 11. User Interactions RLS Policies
DROP POLICY IF EXISTS "Users can manage own interactions" ON public.user_interactions;
CREATE POLICY "Users can manage own interactions" 
  ON public.user_interactions FOR ALL 
  USING (user_id = auth.uid()::text OR user_id = public.get_auth_email());

-- 12. Ensure Root Super Admin Exists in Public Profiles
INSERT INTO public.users (id, name, email, role, status, avatar, created_at)
VALUES (
  'u_chetan',
  'Chetan Prajapat',
  'chetanprajapat340@gmail.com',
  'superadmin',
  'active',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat',
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET role = 'superadmin', status = 'active';
