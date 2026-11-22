const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://admin.theopenbrief.app'

export interface Article {
  id: string
  title: string
  slug: string
  section: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'general'
  excerpt?: string
  content: string
  coverImage?: string
  coverImageCaption?: string
  authorId?: string
  authorName: string
  authorBio?: string
  authorAvatar?: string
  publishedDate: string
  readTime: number
}

/**
 * Normalizes an article row from Supabase PostgreSQL
 */
function normalizeArticle(item: any): Article {
  let sec: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'general' = 'standalone'
  const rawType = (item.section || '').toLowerCase()
  if (rawType === 'journal') sec = 'journal'
  else if (rawType === 'explainers') sec = 'explainers'
  else if (rawType === 'tech') sec = 'tech'
  else if (rawType === 'cinebrief' || rawType === 'cine') sec = 'cinebrief'
  else if (rawType === 'general') sec = 'general'
  else sec = 'standalone'

  const authorName = item.author_name || 'The Open Brief Desk'
  const authorBio = item.author_bio || ''
  const authorAvatar = item.author_avatar_url || undefined
  const authorId = item.author_id || undefined
  const coverImage = item.cover_image_url || undefined
  const coverImageCaption = item.cover_image_caption || undefined
  const readTime = Number(item.read_time_minutes || 5)
  const publishedDate = item.published_at || item.created_at || new Date().toISOString()

  return {
    id: String(item.id || item.slug),
    title: item.title || 'Untitled Dispatch',
    slug: item.slug,
    section: sec,
    excerpt: item.excerpt || '',
    content: item.content || '',
    coverImage,
    coverImageCaption,
    authorId,
    authorName,
    authorBio,
    authorAvatar,
    publishedDate,
    readTime,
  }
}

/**
 * Fetch published articles from Admin Supabase PostgreSQL API.
 */
export async function fetchArticles(sectionFilter?: string): Promise<Article[]> {
  try {
    const params = new URLSearchParams()
    if (sectionFilter) {
      params.append('section', sectionFilter)
    }

    const res = await fetch(`${CMS_URL}/api/articles?${params.toString()}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.docs)) {
        return data.docs.map(normalizeArticle)
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Failed to fetch articles (${CMS_URL}):`, (err as any)?.message)
  }

  return []
}

/**
 * Fetch a single article by slug from Supabase PostgreSQL
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${CMS_URL}/api/articles?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.docs) && data.docs.length > 0) {
        return normalizeArticle(data.docs[0])
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Error fetching slug '${slug}':`, (err as any)?.message)
  }

  return null
}

/**
 * Fetch all articles written by a specific author
 */
export async function fetchArticlesByAuthor(author: string): Promise<Article[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/articles?author=${encodeURIComponent(author)}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.docs) && data.docs.length > 0) {
        return data.docs.map(normalizeArticle)
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Failed to fetch articles by author '${author}':`, (err as any)?.message)
  }

  // Fallback: fetch all and filter in memory
  const all = await fetchArticles()
  const cleanTarget = author.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return all.filter((a) => {
    const aSlug = a.authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return aSlug === cleanTarget || a.authorName.toLowerCase() === author.toLowerCase() || a.authorId === author
  })
}
