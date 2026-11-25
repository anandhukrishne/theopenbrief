import { NextRequest, NextResponse } from 'next/server'
import { db, initDb, getOrCreateProfile, UserProfile } from '@/lib/db'
import { getAuthUser as verifyToken } from '@/lib/auth'

const WEB_APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app'

async function triggerWebRevalidation(editionSlug?: string) {
  const secret = process.env.REVALIDATION_SECRET
  if (!secret) return

  try {
    await fetch(`${WEB_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({
        path: editionSlug ? `/editions/${editionSlug}` : '/editions',
      }),
    })
  } catch (err) {
    console.warn('[Revalidate Trigger] Non-blocking revalidation failed:', (err as any)?.message)
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
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    // Single Edition Query (by slug or id)
    if (slug || id) {
      const editionRes = slug
        ? await db.query('SELECT * FROM public.editions WHERE slug = $1 OR LOWER(slug) = LOWER($1)', [slug.trim()])
        : await db.query('SELECT * FROM public.editions WHERE id = $1', [id])

      if (editionRes.rows.length === 0) {
        return NextResponse.json({ error: 'Edition not found' }, { status: 404 })
      }

      const edition = editionRes.rows[0]
      const auth = await getAuthUser(req)

      if (edition.status !== 'published' && (!auth || (auth.profile.role !== 'admin' && auth.profile.role !== 'editor'))) {
        return NextResponse.json({ error: 'Edition is in draft mode' }, { status: 403 })
      }

      // Fetch curated articles for this edition
      let articles: any[] = []
      const rawArticleIds = edition.article_ids || []
      const parsedIds: string[] = Array.isArray(rawArticleIds)
        ? rawArticleIds
        : typeof rawArticleIds === 'string'
        ? JSON.parse(rawArticleIds)
        : []

      if (parsedIds.length > 0) {
        // Fetch matching articles and preserve curated ordering
        const artRes = await db.query(
          `SELECT id, title, slug, section, status, excerpt, content, cover_image_url, cover_image_caption,
                  author_id, author_name, author_bio, author_avatar_url, read_time_minutes, published_at
           FROM public.articles
           WHERE id = ANY($1::uuid[]) AND status = 'published'`,
          [parsedIds]
        )

        const artMap = new Map(artRes.rows.map((a: any) => [String(a.id), a]))
        // Curated order
        parsedIds.forEach((artId) => {
          const found = artMap.get(String(artId))
          if (found) {
            articles.push(found)
            artMap.delete(String(artId))
          }
        })
      }

      // Also append any articles explicitly assigned to this edition via edition_slug or edition_id
      const linkedRes = await db.query(
        `SELECT id, title, slug, section, status, excerpt, content, cover_image_url, cover_image_caption,
                author_id, author_name, author_bio, author_avatar_url, read_time_minutes, published_at
         FROM public.articles
         WHERE (edition_slug = $1 OR edition_id = $2) AND status = 'published'
         ORDER BY published_at DESC`,
        [edition.slug, edition.id]
      )

      for (const linked of linkedRes.rows) {
        if (!articles.some((a) => String(a.id) === String(linked.id))) {
          articles.push(linked)
        }
      }

      return NextResponse.json(
        { edition, articles },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      )
    }

    // List all editions
    const auth = await getAuthUser(req)
    const isStaff = auth && (auth.profile.role === 'admin' || auth.profile.role === 'editor')

    let query = isStaff
      ? `SELECT e.*,
                (SELECT COUNT(*) FROM public.articles a WHERE a.edition_slug = e.slug OR a.edition_id = e.id) AS linked_count
         FROM public.editions e
         ORDER BY e.published_at DESC`
      : `SELECT e.id, e.title, e.slug, e.subtitle, e.description, e.cover_image_url,
                e.theme_preset, e.accent_color, e.badge_text, e.status, e.article_ids, e.published_at
         FROM public.editions e
         WHERE e.status = 'published'
         ORDER BY e.published_at DESC`

    const listRes = await db.query(query)

    return NextResponse.json(
      { editions: listRes.rows },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (err: any) {
    console.error('Error in GET /api/editions:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch editions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth || (auth.profile.role !== 'admin' && auth.profile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    await initDb()
    const body = await req.json()
    const {
      title,
      slug,
      subtitle = '',
      description = '',
      editor_note = '',
      cover_image_url = '',
      theme_preset = 'christmas',
      accent_color = '#B91C1C',
      badge_text = 'SPECIAL EDITION',
      status = 'published',
      article_ids = [],
    } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check slug collision
    const existing = await db.query('SELECT id FROM public.editions WHERE slug = $1', [cleanSlug])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: `An edition with slug "${cleanSlug}" already exists.` }, { status: 400 })
    }

    const insertRes = await db.query(
      `INSERT INTO public.editions (
        title, slug, subtitle, description, editor_note, cover_image_url,
        theme_preset, accent_color, badge_text, status, article_ids, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *;`,
      [
        title.trim(),
        cleanSlug,
        subtitle.trim(),
        description.trim(),
        editor_note.trim(),
        cover_image_url.trim(),
        theme_preset,
        accent_color,
        badge_text.trim(),
        status,
        JSON.stringify(article_ids),
      ]
    )

    const created = insertRes.rows[0]
    await triggerWebRevalidation(created.slug)

    return NextResponse.json({ success: true, edition: created })
  } catch (err: any) {
    console.error('Error creating edition:', err)
    return NextResponse.json({ error: err.message || 'Failed to create edition' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth || (auth.profile.role !== 'admin' && auth.profile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    await initDb()
    const body = await req.json()
    const {
      id,
      title,
      slug,
      subtitle = '',
      description = '',
      editor_note = '',
      cover_image_url = '',
      theme_preset = 'christmas',
      accent_color = '#B91C1C',
      badge_text = 'SPECIAL EDITION',
      status = 'published',
      article_ids = [],
    } = body

    if (!id || !title || !slug) {
      return NextResponse.json({ error: 'ID, title and slug are required' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if edition exists
    const existing = await db.query('SELECT * FROM public.editions WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 })
    }

    // Check slug collision with other editions
    const collision = await db.query('SELECT id FROM public.editions WHERE slug = $1 AND id != $2', [cleanSlug, id])
    if (collision.rows.length > 0) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already in use by another edition.` }, { status: 400 })
    }

    const updateRes = await db.query(
      `UPDATE public.editions SET
        title = $1,
        slug = $2,
        subtitle = $3,
        description = $4,
        editor_note = $5,
        cover_image_url = $6,
        theme_preset = $7,
        accent_color = $8,
        badge_text = $9,
        status = $10,
        article_ids = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *;`,
      [
        title.trim(),
        cleanSlug,
        subtitle.trim(),
        description.trim(),
        editor_note.trim(),
        cover_image_url.trim(),
        theme_preset,
        accent_color,
        badge_text.trim(),
        status,
        JSON.stringify(article_ids),
        id,
      ]
    )

    const updated = updateRes.rows[0]
    await triggerWebRevalidation(updated.slug)

    return NextResponse.json({ success: true, edition: updated })
  } catch (err: any) {
    console.error('Error updating edition:', err)
    return NextResponse.json({ error: err.message || 'Failed to update edition' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth || (auth.profile.role !== 'admin' && auth.profile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Edition ID is required' }, { status: 400 })
    }

    await initDb()

    const findRes = await db.query('SELECT * FROM public.editions WHERE id = $1', [id])
    if (findRes.rows.length === 0) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 })
    }

    const edition = findRes.rows[0]

    // Clear edition link on articles
    await db.query('UPDATE public.articles SET edition_id = NULL, edition_slug = \'\' WHERE edition_id = $1 OR edition_slug = $2', [id, edition.slug])

    // Delete the edition
    await db.query('DELETE FROM public.editions WHERE id = $1', [id])
    await triggerWebRevalidation(edition.slug)

    return NextResponse.json({ success: true, message: `Edition "${edition.title}" deleted successfully.` })
  } catch (err: any) {
    console.error('Error deleting edition:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete edition' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
