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
    const editionParam = searchParams.get('edition') || searchParams.get('edition_slug')

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
          `SELECT id, title, slug, section, status, author_id, author_name, read_time_minutes, published_at, excerpt, is_story_of_the_day
           FROM articles
           WHERE status = 'published'
           ORDER BY published_at DESC
           LIMIT 100`
        )
        return NextResponse.json({ docs: result.rows })
      }
    }

    let query = slug
      ? `SELECT a.*, COALESCE(NULLIF(p.name, ''), a.author_name) AS author_name, COALESCE(NULLIF(p.bio, ''), a.author_bio) AS author_bio, COALESCE(NULLIF(p.avatar_url, ''), a.author_avatar_url) AS author_avatar_url, COALESCE(p.beat, '') AS author_beat, COALESCE(p.role, 'writer') AS author_role
         FROM articles a
         LEFT JOIN public.profiles p ON a.author_id = p.id
         WHERE a.status = $1`
      : `SELECT a.id, a.title, a.slug, a.section, a.excerpt, a.cover_image_url, a.cover_image_caption, a.author_id, COALESCE(NULLIF(p.name, ''), a.author_name) AS author_name, COALESCE(NULLIF(p.bio, ''), a.author_bio) AS author_bio, COALESCE(NULLIF(p.avatar_url, ''), a.author_avatar_url) AS author_avatar_url, COALESCE(p.beat, '') AS author_beat, COALESCE(p.role, 'writer') AS author_role, a.read_time_minutes, a.published_at, a.is_story_of_the_day
         FROM articles a
         LEFT JOIN public.profiles p ON a.author_id = p.id
         WHERE a.status = $1`
    const values: any[] = ['published']

    if (slug) {
      query += ' AND (a.slug = $2 OR LOWER(a.slug) = LOWER($2))'
      values.push(slug.trim())
    } else {
      if (section) {
        if (section === 'general' || section === 'standalone') {
          query += ` AND (a.section = 'general' OR a.section = 'standalone')`
        } else {
          query += ` AND a.section = $${values.length + 1}`
          values.push(section)
        }
      }
      if (authorParam) {
        query += ` AND (a.author_id = $${values.length + 1} OR LOWER(COALESCE(NULLIF(p.name, ''), a.author_name)) = LOWER($${values.length + 1}) OR REPLACE(LOWER(COALESCE(NULLIF(p.name, ''), a.author_name)), ' ', '-') = LOWER($${values.length + 1}))`
        values.push(authorParam.trim())
      }
      if (editionParam) {
        query += ` AND (a.edition_slug = $${values.length + 1} OR LOWER(a.edition_slug) = LOWER($${values.length + 1}))`
        values.push(editionParam.trim())
      }
    }

    query += ' ORDER BY a.published_at DESC LIMIT 50'

    const result = await db.query(query, values)
    return NextResponse.json(
      { docs: result.rows },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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
      edition_id = null,
      edition_slug = '',
      is_story_of_the_day = false,
      id,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required article fields' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const validSections = ['journal', 'explainers', 'tech', 'cinebrief', 'standalone', 'general', 'editions']
    const safeSection = validSections.includes(section) ? section : 'standalone'
    const pinStoryOfTheDay = Boolean(is_story_of_the_day)

    if (pinStoryOfTheDay) {
      await db.query('UPDATE articles SET is_story_of_the_day = false WHERE is_story_of_the_day = true')
    }

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
          edition_id = $8,
          edition_slug = $9,
          is_story_of_the_day = $10,
          updated_at = NOW()
        WHERE id = $11
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
        edition_id || null,
        edition_slug || '',
        pinStoryOfTheDay,
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
        author_id, author_name, author_bio, author_avatar_url, read_time_minutes,
        edition_id, edition_slug, is_story_of_the_day
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
      edition_id || null,
      edition_slug || '',
      pinStoryOfTheDay,
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

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 })
    }

    await initDb()
    const { id, is_story_of_the_day } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const findRes = await db.query('SELECT * FROM articles WHERE id = $1', [id])
    if (findRes.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = findRes.rows[0]
    const canManage =
      auth.profile.role === 'admin' ||
      auth.profile.role === 'editor' ||
      article.author_id === auth.uid

    if (!canManage) {
      return NextResponse.json(
        { error: 'Forbidden: Only editors, admins, or the article author can update Story of the Day.' },
        { status: 403 }
      )
    }

    const nextValue = Boolean(is_story_of_the_day)
    if (nextValue) {
      await db.query('UPDATE articles SET is_story_of_the_day = false WHERE is_story_of_the_day = true')
    }

    const updated = await db.query(
      'UPDATE articles SET is_story_of_the_day = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [nextValue, id]
    )

    await triggerWebRevalidation(article.slug, article.section)

    return NextResponse.json({ success: true, article: updated.rows[0] })
  } catch (err: any) {
    console.error('Error updating Story of the Day:', err)
    return NextResponse.json({ error: err.message || 'Failed to update Story of the Day' }, { status: 500 })
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}