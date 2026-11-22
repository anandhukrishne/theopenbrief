import { Pool } from 'pg'

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  ''

// Reusable PostgreSQL pool for Supabase
export const db = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  beat?: string
  password_plain?: string
  role: 'admin' | 'editor' | 'writer'
  created_at: string
  updated_at: string
}

let dbInitialized = false

/**
 * Initializes the required schema in Supabase PostgreSQL if it does not exist yet.
 */
export async function initDb() {
  if (dbInitialized || !connectionString) return

  try {
    await db.query(`
      -- Profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY, -- Supabase UID or generated UUID
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        beat TEXT DEFAULT '',
        password_plain TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'writer', -- 'admin', 'editor', 'writer'
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Articles table
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        section TEXT NOT NULL, -- 'journal', 'explainers', 'tech', 'cinebrief', 'standalone', 'general'
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

      -- Ensure all columns exist on profiles
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beat TEXT DEFAULT '';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_plain TEXT DEFAULT '';

      -- Ensure all columns exist on articles
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id TEXT;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'The Open Brief Desk';
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_bio TEXT DEFAULT '';
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_avatar_url TEXT DEFAULT '';
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT '';
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_caption TEXT DEFAULT '';

      -- Performance indexes for Supabase queries
      CREATE INDEX IF NOT EXISTS idx_articles_section_published ON articles(section, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

      -- OTP verification table
      CREATE TABLE IF NOT EXISTS otps (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL
      );

      -- Rate limits table
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        points INT DEFAULT 1,
        expire_at TIMESTAMPTZ NOT NULL
      );
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

  const existing = await db.query('SELECT * FROM profiles WHERE id = $1', [uid])
  if (existing.rows.length > 0) {
    return existing.rows[0] as UserProfile
  }

  // Check if this is the first user
  const countRes = await db.query('SELECT COUNT(*) FROM profiles')
  const isFirstUser = parseInt(countRes.rows[0].count, 10) === 0
  const assignedRole = isFirstUser ? 'admin' : 'writer'
  const name = defaultName || email.split('@')[0] || 'Contributor'

  const insertRes = await db.query(
    `INSERT INTO profiles (id, email, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
     RETURNING *`,
    [uid, email, name, assignedRole]
  )

  return insertRes.rows[0] as UserProfile
}
