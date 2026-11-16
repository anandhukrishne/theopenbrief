import { SAMPLE_ARTICLES } from './sampleArticles'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://admin.theopenbrief.app'
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.theopenbrief.app'

/**
 * Transforms any media URL to point through your Cloudflare CDN (cdn.theopenbrief.app)
 */
export function getMediaUrl(url?: string | null): string {
  if (!url) return '/og-image.png'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's already a full URL, return or rewrite host to cdn if custom CDN proxy is active
    return url
  }
  return `${CDN_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Fetch published articles from Payload CMS REST API, falling back to rich sample dispatches
 */
export async function fetchArticles(type?: string) {
  try {
    const query = new URLSearchParams({
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      limit: '20',
      depth: '2',
    })

    if (type) {
      query.append('where[type][equals]', type)
    }

    const res = await fetch(`${CMS_URL}/api/articles?${query.toString()}`, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.docs && data.docs.length > 0) {
        return data.docs
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Offline or initializing (${CMS_URL}), serving local fallback:`, (err as any)?.message)
  }

  // Graceful fallback to seeded editorial dispatches
  if (type) {
    return SAMPLE_ARTICLES.filter((a) => a.type === type)
  }
  return SAMPLE_ARTICLES
}

/**
 * Fetch a single article by slug
 */
export async function fetchArticleBySlug(slug: string) {
  try {
    const query = new URLSearchParams({
      'where[slug][equals]': slug,
      'where[status][equals]': 'published',
      depth: '2',
      limit: '1',
    })

    const res = await fetch(`${CMS_URL}/api/articles?${query.toString()}`, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.docs && data.docs.length > 0) {
        return data.docs[0]
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Error fetching slug '${slug}':`, (err as any)?.message)
  }

  return SAMPLE_ARTICLES.find((a) => a.slug === slug) || null
}
