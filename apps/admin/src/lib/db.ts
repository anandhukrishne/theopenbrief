import { Pool } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL || ''

// Reusable serverless pool instance
export const db = new Pool({ connectionString })

/**
 * Initializes the required tables in Neon PostgreSQL if they don't exist yet
 */
export async function initDb() {
  if (!connectionString) return

  await db.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      section TEXT NOT NULL, -- 'journal', 'explainers', 'tech'
      status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published'
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image_url TEXT,
      author_name TEXT NOT NULL DEFAULT 'The Open Brief Desk',
      read_time_minutes INT DEFAULT 5,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_articles_section_published ON articles(section, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  `)
}
