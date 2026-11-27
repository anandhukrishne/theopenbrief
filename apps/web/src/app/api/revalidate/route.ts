import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { slug, section, previousSection } = body as {
    slug?: string
    section?: string
    previousSection?: string
  }

  revalidateTag('articles')
  revalidatePath('/')
  revalidatePath('/articles/[slug]', 'page')
  revalidatePath('/authors/[author]', 'page')
  revalidatePath('/rss.xml')
  revalidatePath('/sitemap.xml')

  if (slug) {
    revalidateTag(`article:${slug}`)
    revalidatePath(`/articles/${slug}`)
  }

  if (section) {
    revalidateTag(`section:${section}`)
    revalidatePath(`/${section}`)
  }

  if (previousSection) {
    revalidateTag(`section:${previousSection}`)
    revalidatePath(`/${previousSection}`)
  }

  return NextResponse.json({
    revalidated: true,
    slug: slug || null,
    section: section || null,
    previousSection: previousSection || null,
  })
}