const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://admin.theopenbrief.app'

export interface Article {
  id: string
  title: string
  slug: string
  section: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'general' | 'editions'
  excerpt?: string
  content: string
  coverImage?: string
  coverImageCaption?: string
  authorId?: string
  authorName: string
  authorBio?: string
  authorAvatar?: string
  authorBeat?: string
  authorRole?: string
  editionId?: string
  editionSlug?: string
  isStoryOfTheDay?: boolean
  publishedDate: string
  readTime: number
}

export interface Edition {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  editorNote?: string
  coverImage?: string
  themePreset: 'christmas' | 'republic' | 'heritage' | 'monsoon' | 'midnight' | 'classic'
  accentColor?: string
  badgeText?: string
  status: 'draft' | 'published'
  articleIds?: string[]
  publishedDate: string
}

function normalizeEdition(item: any): Edition {
  return {
    id: String(item.id || item.slug),
    title: item.title || 'Special Edition',
    slug: item.slug,
    subtitle: item.subtitle || '',
    description: item.description || '',
    editorNote: item.editor_note || '',
    coverImage: item.cover_image_url || undefined,
    themePreset: item.theme_preset || 'christmas',
    accentColor: item.accent_color || '#B91C1C',
    badgeText: item.badge_text || 'SPECIAL EDITION',
    status: item.status || 'published',
    articleIds: Array.isArray(item.article_ids) ? item.article_ids : [],
    publishedDate: item.published_at || item.created_at || new Date().toISOString(),
  }
}

function normalizeArticle(item: any): Article {
  let sec: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'general' | 'editions' = 'standalone'
  const rawType = (item.section || '').toLowerCase()
  if (rawType === 'journal') sec = 'journal'
  else if (rawType === 'explainers') sec = 'explainers'
  else if (rawType === 'tech') sec = 'tech'
  else if (rawType === 'cinebrief' || rawType === 'cine') sec = 'cinebrief'
  else if (rawType === 'general' || rawType === 'standalone') sec = 'general'
  else if (rawType === 'editions' || rawType === 'edition') sec = 'editions'
  else sec = 'general'

  return {
    id: String(item.id || item.slug),
    title: item.title || 'Untitled Dispatch',
    slug: item.slug,
    section: sec,
    excerpt: item.excerpt || '',
    content: item.content || '',
    coverImage: item.cover_image_url || undefined,
    coverImageCaption: item.cover_image_caption || undefined,
    authorId: item.author_id || undefined,
    authorName: item.author_name || 'The Open Brief Desk',
    authorBio: item.author_bio || '',
    authorAvatar: item.author_avatar_url || undefined,
    authorBeat: item.author_beat || undefined,
    authorRole: item.author_role || undefined,
    editionId: item.edition_id || undefined,
    editionSlug: item.edition_slug || undefined,
    isStoryOfTheDay: Boolean(item.is_story_of_the_day),
    publishedDate: item.published_at || item.created_at || new Date().toISOString(),
    readTime: Number(item.read_time_minutes || 5),
  }
}

export async function fetchArticles(sectionFilter?: string): Promise<Article[]> {
  try {
    const params = new URLSearchParams()
    if (sectionFilter) {
      params.append('section', sectionFilter)
    }

    const tags = sectionFilter ? ['articles', `section:${sectionFilter}`] : ['articles']
    const res = await fetch(`${CMS_URL}/api/articles?${params.toString()}`, {
      next: { revalidate: 3600, tags },
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
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

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${CMS_URL}/api/articles?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600, tags: ['articles', `article:${slug}`] },
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
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

export async function fetchArticlesByAuthor(author: string): Promise<Article[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/articles?author=${encodeURIComponent(author)}`, {
      next: { revalidate: 3600, tags: ['articles', `author:${author}`] },
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
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

  const all = await fetchArticles()
  const cleanTarget = author.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return all.filter((a) => {
    const aSlug = a.authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return aSlug === cleanTarget || a.authorName.toLowerCase() === author.toLowerCase() || a.authorId === author
  })
}

export async function fetchEditions(): Promise<Edition[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/editions`, {
      next: { revalidate: 3600, tags: ['editions'] },
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.editions)) {
        return data.editions.map(normalizeEdition)
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Failed to fetch editions (${CMS_URL}):`, (err as any)?.message)
  }

  return []
}

export async function fetchEditionBySlug(slug: string): Promise<{ edition: Edition; articles: Article[] } | null> {
  try {
    const res = await fetch(`${CMS_URL}/api/editions?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600, tags: ['editions', `edition:${slug}`] },
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.edition) {
        return {
          edition: normalizeEdition(data.edition),
          articles: Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [],
        }
      }
    }
  } catch (err) {
    console.warn(`[CMS API] Error fetching edition slug '${slug}':`, (err as any)?.message)
  }

  return null
}
