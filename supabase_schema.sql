-- ==============================================================================
-- THE OPEN BRIEF - SUPABASE SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Profiles Table (Newsroom Roster, Staff & Password Access)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  beat TEXT DEFAULT '',
  password_plain TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'writer', -- 'admin', 'editor', 'writer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Articles Table (Dispatches & Essays)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL DEFAULT 'journal', -- 'journal', 'explainers', 'tech', 'cinebrief', 'standalone', 'general'
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published'
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  cover_image_url TEXT DEFAULT '',
  cover_image_caption TEXT DEFAULT '',
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'The Open Brief Desk',
  author_bio TEXT DEFAULT '',
  author_avatar_url TEXT DEFAULT '',
  read_time_minutes INT DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. One-Time Password Verification Table (2FA Newsroom Verification)
CREATE TABLE IF NOT EXISTS public.otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Brute-Force Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  identifier TEXT PRIMARY KEY,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_articles_section_published ON public.articles(section, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY IF NOT EXISTS "Public can view published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

-- Allow service role full access to all tables
CREATE POLICY IF NOT EXISTS "Service role full access to articles"
  ON public.articles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to profiles"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
  WITH CHECK (true);
