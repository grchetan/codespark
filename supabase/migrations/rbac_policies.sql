-- ==============================================================================
-- CODESPARK ROLE-BASED ACCESS CONTROL (RBAC) & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Ensure all base tables exist so no "relation does not exist" error occurs
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  avatar TEXT,
  bio TEXT,
  effects_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.effects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT DEFAULT '',
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'medium',
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
  status TEXT DEFAULT 'published',
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
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.requirements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'feature',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
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
  status TEXT DEFAULT 'unread'
);

-- 2. Update role and status check constraints on public.users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Drop existing role constraint if present and recreate with superadmin
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('superadmin', 'admin', 'moderator', 'member'));

-- 3. Security Functions to Determine Caller Role
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

-- 4. Trigger: Unbreakable Root Super Admin & Role Protection
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
    IF (NEW.role IN ('admin', 'superadmin') AND OLD.role NOT IN ('admin', 'superadmin')) THEN
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

-- 5. Enable Row Level Security (RLS) on all relevant tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- 6. Users Table RLS Policies
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
    AND role = (SELECT role FROM public.users WHERE id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can manage members and moderators" ON public.users;
CREATE POLICY "Admins can manage members and moderators" 
  ON public.users FOR ALL 
  USING (public.is_admin());

-- 7. Effects Table RLS Policies
DROP POLICY IF EXISTS "Public can view published effects" ON public.effects;
CREATE POLICY "Public can view published effects" 
  ON public.effects FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can insert and update effects" ON public.effects;
CREATE POLICY "Admins can insert and update effects" 
  ON public.effects FOR ALL 
  USING (public.is_admin());

-- 8. Submissions Table RLS Policies
DROP POLICY IF EXISTS "Users can view and insert their own submissions" ON public.submissions;
CREATE POLICY "Users can view and insert their own submissions" 
  ON public.submissions FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Staff can review and update submissions" ON public.submissions;
CREATE POLICY "Staff can review and update submissions" 
  ON public.submissions FOR ALL 
  USING (public.is_moderator());

-- 9. Contact Messages & Requirements RLS Policies
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

-- 10. Set the Super Admin account in database
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
