import { Pool } from 'pg'

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  ''

const globalForPg = globalThis as unknown as { pgPool?: Pool }

// Reusable singleton PostgreSQL pool sized for serverless + Supabase pooler limits
export const db =
  globalForPg.pgPool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: connectionString ? { rejectUnauthorized: false } : undefined,
    max: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  })

if (!globalForPg.pgPool) {
  globalForPg.pgPool = db
}

export interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  beat?: string
  role: 'admin' | 'editor' | 'writer'
  created_at: string
  updated_at: string
}

export interface Edition {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  editor_note?: string
  cover_image_url?: string
  theme_preset: 'christmas' | 'republic' | 'heritage' | 'monsoon' | 'midnight' | 'classic'
  accent_color?: string
  badge_text?: string
  status: 'draft' | 'published'
  article_ids?: string[]
  published_at: string
  created_at: string
  updated_at: string
}

let dbInitialized = false

/**
 * Initializes the verified schema in Supabase PostgreSQL if it does not exist yet.
 */
export async function initDb() {
  if (dbInitialized || !connectionString) return

  try {
    await db.query(`
      -- Profiles table (newsroom roster without plaintext passwords)
      CREATE TABLE IF NOT EXISTS public.profiles (
        id TEXT NOT NULL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        beat TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'writer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Articles table
      CREATE TABLE IF NOT EXISTS public.articles (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        section TEXT NOT NULL DEFAULT 'journal',
        status TEXT NOT NULL DEFAULT 'published',
        excerpt TEXT DEFAULT '',
        content TEXT NOT NULL,
        cover_image_url TEXT DEFAULT '',
        cover_image_caption TEXT DEFAULT '',
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL DEFAULT 'TheOpenBrief Desk',
        author_bio TEXT DEFAULT '',
        author_avatar_url TEXT DEFAULT '',
        read_time_minutes INT DEFAULT 5,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Brute-force rate limiting table
      CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
        identifier TEXT NOT NULL PRIMARY KEY,
        failed_attempts INT NOT NULL DEFAULT 0,
        locked_until TIMESTAMPTZ,
        last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Ensure columns exist
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS beat TEXT DEFAULT '';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'writer';

      -- Special Editions table (curated commemorative issues like Christmas, Republic, etc.)
      CREATE TABLE IF NOT EXISTS public.editions (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        subtitle TEXT DEFAULT '',
        description TEXT DEFAULT '',
        editor_note TEXT DEFAULT '',
        cover_image_url TEXT DEFAULT '',
        theme_preset TEXT DEFAULT 'christmas',
        accent_color TEXT DEFAULT '#B91C1C',
        badge_text TEXT DEFAULT 'SPECIAL EDITION',
        status TEXT NOT NULL DEFAULT 'published',
        article_ids JSONB DEFAULT '[]'::jsonb,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Add edition and story_of_the_day columns to articles if missing
      ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edition_id UUID;
      ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edition_slug TEXT DEFAULT '';
      ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_story_of_the_day BOOLEAN DEFAULT false;

      -- Newsletter subscribers table
      CREATE TABLE IF NOT EXISTS public.subscribers (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active',
        source TEXT DEFAULT 'about_page',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Performance indexes for Supabase queries
      CREATE INDEX IF NOT EXISTS idx_articles_section_published ON public.articles(section, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
      CREATE INDEX IF NOT EXISTS idx_articles_edition_slug ON public.articles(edition_slug);
      CREATE INDEX IF NOT EXISTS idx_editions_slug ON public.editions(slug);
      CREATE INDEX IF NOT EXISTS idx_editions_status ON public.editions(status);
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
    `)

    dbInitialized = true
  } catch (err: any) {
    console.warn('[Supabase DB] Schema init warning:', err?.message || err)
  }
}

/**
 * Retrieves or creates a profile for an authenticated user in Supabase.
 * The first registered profile is automatically granted the 'admin' role.
 */
export async function getOrCreateProfile(uid: string, email: string, defaultName?: string): Promise<UserProfile> {
  await initDb()

  const existing = await db.query('SELECT * FROM public.profiles WHERE id = $1', [uid])
  if (existing.rows.length > 0) {
    return existing.rows[0] as UserProfile
  }

  // Check if this is the first user
  const countRes = await db.query('SELECT COUNT(*) FROM public.profiles')
  const isFirstUser = parseInt(countRes.rows[0].count, 10) === 0
  const assignedRole = isFirstUser ? 'admin' : 'writer'
  const name = defaultName || email.split('@')[0] || 'Contributor'

  const insertRes = await db.query(
    `INSERT INTO public.profiles (id, email, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
     RETURNING *`,
    [uid, email, name, assignedRole]
  )

  return insertRes.rows[0] as UserProfile
}
