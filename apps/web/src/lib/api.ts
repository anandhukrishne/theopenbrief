import { SAMPLE_ARTICLES } from './sampleArticles'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://admin.theopenbrief.app'
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.theopenbrief.app'

export interface Article {
  id: string
  title: string
  slug: string
  section: 'journal' | 'explainers' | 'tech'
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  publishedDate: string
  readTime: number
}

/**
 * Normalizes an article row from Neon PostgreSQL or fallback sample articles
 */
function normalizeArticle(item: any): Article {
  // Normalize section / type
  let sec: 'journal' | 'explainers' | 'tech' = 'journal'
  const rawType = (item.section || item.type || '').toLowerCase()
  if (rawType.includes('explainer')) sec = 'explainers'
  else if (rawType.includes('tech')) sec = 'tech'
  else sec = 'journal'

  // Normalize author
  const authorName = item.author_name || (typeof item.author === 'object' ? item.author?.name : item.author) || 'The Open Brief Desk'

  // Normalize cover image
  let coverImage = item.cover_image_url || item.coverImage?.url || item.coverImage || ''
  if (coverImage && !coverImage.startsWith('http://') && !coverImage.startsWith('https://')) {
    coverImage = `${CDN_URL}/${coverImage.replace(/^\/+/, '')}`
  }

  // Normalize read time
  const readTime = Number(item.read_time_minutes || item.readTime || 5)

  // Normalize published date
  const publishedDate = item.published_at || item.publishedDate || item.createdAt || new Date().toISOString()

  return {
    id: String(item.id || item.slug),
    title: item.title || 'Untitled Dispatch',
    slug: item.slug,
    section: sec,
    excerpt: item.excerpt || '',
    content: item.content || '',
    coverImage: coverImage || undefined,
    authorName,
    publishedDate,
    readTime,
  }
}

/**
 * Fetch published articles from Admin Neon PostgreSQL API or fallback
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
      if (Array.isArray(data.docs) && data.docs.length > 0) {
        return data.docs.map(normalizeArticle)
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Offline (${CMS_URL}), serving curated local dispatches:`, (err as any)?.message)
  }

  // Fallback to sample articles
  let list = SAMPLE_ARTICLES.map(normalizeArticle)
  if (sectionFilter) {
    list = list.filter((a) => a.section === sectionFilter)
  }
  return list
}

/**
 * Fetch a single article by slug
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
        const match = data.docs.find((d: any) => d.slug === slug) || data.docs[0]
        return normalizeArticle(match)
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Error fetching slug '${slug}':`, (err as any)?.message)
  }

  const found = SAMPLE_ARTICLES.find((a) => a.slug === slug)
  return found ? normalizeArticle(found) : null
}
