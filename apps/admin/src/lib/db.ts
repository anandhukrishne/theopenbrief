import { Pool } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL || ''

// Reusable serverless pool instance
export const db = new Pool({ connectionString })

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

/**
 * Initializes the required tables in Neon PostgreSQL if they don't exist yet
 */
export async function initDb() {
  if (!connectionString) return

  await db.query(`
    -- Profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY, -- Firebase UID or generated UUID
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
      section TEXT NOT NULL, -- 'journal', 'explainers', 'tech', 'standalone'
      status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published'
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image_url TEXT,
      cover_image_caption TEXT,
      author_id TEXT,
      author_name TEXT NOT NULL DEFAULT 'The Open Brief Desk',
      author_bio TEXT,
      author_avatar_url TEXT,
      read_time_minutes INT DEFAULT 5,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Alter table safely for any existing database instances
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beat TEXT DEFAULT '';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_plain TEXT DEFAULT '';
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_bio TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_avatar_url TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_caption TEXT;

    CREATE INDEX IF NOT EXISTS idx_articles_section_published ON articles(section, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
  `)
}

/**
 * Retrieves or creates a profile for an authenticated user.
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
