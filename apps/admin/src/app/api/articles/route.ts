import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'
import { adminAuth } from '@/lib/firebaseAdmin'

// GET /api/articles - Fetch all articles (with optional section filter)
export async function GET(req: NextRequest) {
  try {
    await initDb()
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section')

    let query = 'SELECT * FROM articles WHERE status = $1'
    const values: any[] = ['published']

    if (section) {
      query += ' AND section = $2'
      values.push(section)
    }

    query += ' ORDER BY published_at DESC LIMIT 50'

    const result = await db.query(query, values)
    return NextResponse.json({ docs: result.rows })
  } catch (err: any) {
    console.error('Error in GET /api/articles:', err)
    return NextResponse.json({ docs: [], error: err.message }, { status: 500 })
  }
}

// POST /api/articles - Create/Publish a new article
export async function POST(req: NextRequest) {
  try {
    // Session authorization check
    const sessionCookie = req.cookies.get('openbrief_session')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Session expired' }, { status: 401 })
    }

    await initDb()
    const body = await req.json()
    const {
      title,
      slug,
      section,
      excerpt,
      content,
      cover_image_url,
      author_name = decodedToken.email?.split('@')[0] || 'The Open Brief Desk',
      read_time_minutes = 5,
    } = body

    if (!title || !slug || !section || !content) {
      return NextResponse.json({ error: 'Missing required article fields' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const insertQuery = `
      INSERT INTO articles (
        title, slug, section, excerpt, content, cover_image_url, author_name, read_time_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        section = EXCLUDED.section,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        cover_image_url = EXCLUDED.cover_image_url,
        read_time_minutes = EXCLUDED.read_time_minutes,
        updated_at = NOW()
      RETURNING *;
    `

    const values = [
      title,
      cleanSlug,
      section,
      excerpt,
      content,
      cover_image_url,
      author_name,
      read_time_minutes,
    ]

    const result = await db.query(insertQuery, values)
    return NextResponse.json({ success: true, article: result.rows[0] })
  } catch (err: any) {
    console.error('Error creating article:', err)
    return NextResponse.json({ error: err.message || 'Failed to save article' }, { status: 500 })
  }
}
