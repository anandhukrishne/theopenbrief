-- ==============================================================================
-- THE OPEN BRIEF - VERIFIED SUPABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Profiles Table (Newsroom Roster & Contributor Metadata - Zero Plaintext Passwords)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  bio text DEFAULT ''::text,
  avatar_url text DEFAULT ''::text,
  beat text DEFAULT ''::text,
  role text NOT NULL DEFAULT 'writer'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- 2. Articles Table (Dispatches, Essays, and Investigations)
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  section text NOT NULL DEFAULT 'journal'::text,
  status text NOT NULL DEFAULT 'published'::text,
  excerpt text DEFAULT ''::text,
  content text NOT NULL,
  cover_image_url text DEFAULT ''::text,
  cover_image_caption text DEFAULT ''::text,
  author_id text NOT NULL,
  author_name text NOT NULL DEFAULT 'The Open Brief Desk'::text,
  author_bio text DEFAULT ''::text,
  author_avatar_url text DEFAULT ''::text,
  read_time_minutes integer DEFAULT 5,
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);

-- 3. Special Editions Table (Curated Issues like Christmas, Republic, etc.)
CREATE TABLE IF NOT EXISTS public.editions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text DEFAULT ''::text,
  description text DEFAULT ''::text,
  editor_note text DEFAULT ''::text,
  cover_image_url text DEFAULT ''::text,
  theme_preset text DEFAULT 'christmas'::text,
  accent_color text DEFAULT '#B91C1C'::text,
  badge_text text DEFAULT 'SPECIAL EDITION'::text,
  status text NOT NULL DEFAULT 'published'::text,
  article_ids jsonb DEFAULT '[]'::jsonb,
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT editions_pkey PRIMARY KEY (id)
);

-- Ensure edition and story of the day columns exist on articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edition_id uuid;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edition_slug text DEFAULT ''::text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_story_of_the_day boolean DEFAULT false;

-- 4. Brute-Force Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  identifier text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone,
  last_attempt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_rate_limits_pkey PRIMARY KEY (identifier)
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_articles_section_published ON public.articles(section, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_edition_slug ON public.articles(edition_slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_editions_slug ON public.editions(slug);
CREATE INDEX IF NOT EXISTS idx_editions_status ON public.editions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles and editions
CREATE POLICY IF NOT EXISTS "Public can view published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Public can view published editions"
  ON public.editions FOR SELECT
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

CREATE POLICY IF NOT EXISTS "Service role full access to editions"
  ON public.editions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role')
  WITH CHECK (true);
