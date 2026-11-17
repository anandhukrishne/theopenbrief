import { NextRequest, NextResponse } from 'next/server'
import { db, initDb, getOrCreateProfile, UserProfile } from '@/lib/db'
import { adminAuth } from '@/lib/firebaseAdmin'

// Helper to authenticate user from session cookie
async function getAuthUser(req: NextRequest): Promise<{ uid: string; email: string; profile: UserProfile } | null> {
  const token = req.cookies.get('openbrief_session')?.value
  if (!token) return null
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const profile = await getOrCreateProfile(decoded.uid, decoded.email || '', decoded.name || '')
    return { uid: decoded.uid, email: decoded.email || '', profile }
  } catch {
    return null
  }
}

// GET /api/articles - Fetch all articles or single by slug/section
export async function GET(req: NextRequest) {
  try {
    await initDb()
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section')
    const slug = searchParams.get('slug')
    const authorId = searchParams.get('author_id')

    let query = 'SELECT * FROM articles WHERE status = $1'
    const values: any[] = ['published']

    if (slug) {
      query += ' AND slug = $2'
      values.push(slug)
    } else {
      if (section) {
        if (section === 'general' || section === 'standalone') {
          query += ` AND (section = 'general' OR section = 'standalone')`
        } else {
          query += ` AND section = $${values.length + 1}`
          values.push(section)
        }
      }
      if (authorId) {
        query += ` AND author_id = $${values.length + 1}`
        values.push(authorId)
      }
    }

    query += ' ORDER BY published_at DESC LIMIT 50'

    const result = await db.query(query, values)
    return NextResponse.json(
      { docs: result.rows },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (err: any) {
    console.error('Error in GET /api/articles:', err)
    return NextResponse.json({ docs: [], error: err.message }, { status: 500 })
  }
}

// POST /api/articles - Create or Update article with Role Hierarchy & Protected Attribution
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 })
    }

    await initDb()
    const body = await req.json()
    const {
      title,
      slug,
      section = 'journal',
      excerpt = '',
      content,
      cover_image_url = '',
      read_time_minutes = 5,
      id, // present if editing an existing article
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required article fields' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Validate section
    const validSections = ['journal', 'explainers', 'tech', 'cinebrief', 'standalone']
    const safeSection = validSections.includes(section) ? section : 'standalone'

    // Check if updating an existing article
    let targetArticle = null
    if (id) {
      const res = await db.query('SELECT * FROM articles WHERE id = $1', [id])
      targetArticle = res.rows[0]
    } else {
      const res = await db.query('SELECT * FROM articles WHERE slug = $1', [cleanSlug])
      targetArticle = res.rows[0]
    }

    if (targetArticle) {
      // Permission check based on hierarchy:
      // admin & editor: can edit any article
      // writer: can only edit articles they created (author_id match)
      const canEdit =
        auth.profile.role === 'admin' ||
        auth.profile.role === 'editor' ||
        targetArticle.author_id === auth.uid

      if (!canEdit) {
        return NextResponse.json(
          { error: 'Forbidden: You only have permission to edit your own articles.' },
          { status: 403 }
        )
      }

      // Update article
      const updateQuery = `
        UPDATE articles SET
          title = $1,
          section = $2,
          excerpt = $3,
          content = $4,
          cover_image_url = $5,
          read_time_minutes = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING *;
      `
      const updateValues = [
        title,
        safeSection,
        excerpt,
        content,
        cover_image_url,
        read_time_minutes,
        targetArticle.id,
      ]

      const updated = await db.query(updateQuery, updateValues)
      return NextResponse.json({ success: true, article: updated.rows[0] })
    }

    // Creating a new article - strictly lock author attribution to current user's profile
    const insertQuery = `
      INSERT INTO articles (
        title, slug, section, excerpt, content, cover_image_url,
        author_id, author_name, author_bio, read_time_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `

    const values = [
      title,
      cleanSlug,
      safeSection,
      excerpt,
      content,
      cover_image_url,
      auth.uid,
      auth.profile.name,
      auth.profile.bio || '',
      read_time_minutes,
    ]

    const result = await db.query(insertQuery, values)
    return NextResponse.json({ success: true, article: result.rows[0] })
  } catch (err: any) {
    console.error('Error saving article:', err)
    return NextResponse.json({ error: err.message || 'Failed to save article' }, { status: 500 })
  }
}

// DELETE /api/articles - Delete an article (Admin/Editor or Article Owner)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (!id && !slug) {
      return NextResponse.json({ error: 'Article ID or slug required' }, { status: 400 })
    }

    await initDb()

    // Find the article
    const findRes = id
      ? await db.query('SELECT * FROM articles WHERE id = $1', [id])
      : await db.query('SELECT * FROM articles WHERE slug = $1', [slug])

    if (findRes.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = findRes.rows[0]

    // Hierarchy check:
    // admin and editor can delete any article
    // writer can only delete their own article
    const canDelete =
      auth.profile.role === 'admin' ||
      auth.profile.role === 'editor' ||
      article.author_id === auth.uid

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this article.' },
        { status: 403 }
      )
    }

    await db.query('DELETE FROM articles WHERE id = $1', [article.id])
    return NextResponse.json({ success: true, message: `Article "${article.title}" deleted successfully.` })
  } catch (err: any) {
    console.error('Error deleting article:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete article' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
