import { NextRequest, NextResponse } from 'next/server'
import { db, initDb, getOrCreateProfile, UserProfile } from '@/lib/db'
import { getAuthUser as verifyToken } from '@/lib/auth'

const WEB_APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app'

async function triggerWebRevalidation(slug?: string, section?: string, previousSection?: string) {
  const secret = process.env.REVALIDATION_SECRET
  if (!secret) return

  const normalizedSection = section === 'standalone' ? 'general' : section
  const normalizedPrev = previousSection === 'standalone' ? 'general' : previousSection

  try {
    await fetch(`${WEB_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({
        slug,
        section: normalizedSection,
        previousSection: normalizedPrev !== normalizedSection ? normalizedPrev : undefined,
      }),
    })
  } catch (err) {
    console.warn('[Revalidate Trigger] Non-blocking revalidation call failed:', (err as any)?.message)
  }
}

async function getAuthUser(req: NextRequest): Promise<{ uid: string; email: string; profile: UserProfile } | null> {
  const user = await verifyToken(req)
  if (!user) return null
  try {
    const profile = await getOrCreateProfile(user.uid, user.email, user.name || '')
    return { uid: user.uid, email: user.email, profile }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section')
    const slug = searchParams.get('slug')
    const idParam = searchParams.get('id')
    const fullParam = searchParams.get('full')
    const authorParam = searchParams.get('author') || searchParams.get('author_id') || searchParams.get('authorId')

    if (idParam || fullParam) {
      const auth = await getAuthUser(req)
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (idParam) {
        const result = await db.query('SELECT * FROM articles WHERE id = $1', [idParam])
        return NextResponse.json({ docs: result.rows })
      }
    }

    if (!slug && !section && !authorParam && !idParam && !fullParam) {
      const auth = await getAuthUser(req)
      if (auth) {
        const result = await db.query(
          `SELECT id, title, slug, section, status, author_id, author_name, read_time_minutes, published_at, excerpt
           FROM articles
           WHERE status = 'published'
           ORDER BY published_at DESC
           LIMIT 100`
        )
        return NextResponse.json({ docs: result.rows })
      }
    }

    let query = slug
      ? 'SELECT * FROM articles WHERE status = $1'
      : 'SELECT id, title, slug, section, excerpt, cover_image_url, cover_image_caption, author_id, author_name, read_time_minutes, published_at FROM articles WHERE status = $1'
    const values: any[] = ['published']

    if (slug) {
      query += ' AND (slug = $2 OR LOWER(slug) = LOWER($2))'
      values.push(slug.trim())
    } else {
      if (section) {
        if (section === 'general' || section === 'standalone') {
          query += ` AND (section = 'general' OR section = 'standalone')`
        } else {
          query += ` AND section = $${values.length + 1}`
          values.push(section)
        }
      }
      if (authorParam) {
        query += ` AND (author_id = $${values.length + 1} OR LOWER(author_name) = LOWER($${values.length + 1}) OR REPLACE(LOWER(author_name), ' ', '-') = LOWER($${values.length + 1}))`
        values.push(authorParam.trim())
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
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (err: any) {
    console.error('Error in GET /api/articles:', err)
    return NextResponse.json({ docs: [], error: err.message }, { status: 500 })
  }
}

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
      cover_image_caption = '',
      read_time_minutes = 5,
      id,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required article fields' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const validSections = ['journal', 'explainers', 'tech', 'cinebrief', 'standalone', 'general']
    const safeSection = validSections.includes(section) ? section : 'standalone'

    let targetArticle = null
    if (id) {
      const res = await db.query('SELECT * FROM articles WHERE id = $1', [id])
      targetArticle = res.rows[0]
    } else {
      const res = await db.query('SELECT * FROM articles WHERE slug = $1', [cleanSlug])
      targetArticle = res.rows[0]
    }

    if (targetArticle) {
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

      const updateQuery = `
        UPDATE articles SET
          title = $1,
          section = $2,
          excerpt = $3,
          content = $4,
          cover_image_url = $5,
          cover_image_caption = $6,
          read_time_minutes = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *;
      `
      const updateValues = [
        title,
        safeSection,
        excerpt,
        content,
        cover_image_url,
        cover_image_caption,
        read_time_minutes,
        targetArticle.id,
      ]

      const updated = await db.query(updateQuery, updateValues)
      const saved = updated.rows[0]
      await triggerWebRevalidation(saved.slug, saved.section, targetArticle.section)

      return NextResponse.json({ success: true, article: saved })
    }

    const insertQuery = `
      INSERT INTO articles (
        title, slug, section, excerpt, content, cover_image_url, cover_image_caption,
        author_id, author_name, author_bio, author_avatar_url, read_time_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `

    const values = [
      title,
      cleanSlug,
      safeSection,
      excerpt,
      content,
      cover_image_url,
      cover_image_caption,
      auth.uid,
      auth.profile.name,
      auth.profile.bio || '',
      auth.profile.avatar_url || '',
      read_time_minutes,
    ]

    const result = await db.query(insertQuery, values)
    const created = result.rows[0]
    await triggerWebRevalidation(created.slug, created.section)

    return NextResponse.json({ success: true, article: created })
  } catch (err: any) {
    console.error('Error saving article:', err)
    return NextResponse.json({ error: err.message || 'Failed to save article' }, { status: 500 })
  }
}

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

    const findRes = id
      ? await db.query('SELECT * FROM articles WHERE id = $1', [id])
      : await db.query('SELECT * FROM articles WHERE slug = $1', [slug])

    if (findRes.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = findRes.rows[0]

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
    await triggerWebRevalidation(article.slug, article.section)

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