import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SAMPLE_ARTICLES } from '@/lib/sampleArticles'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

async function getArticle(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    })
    if (docs[0]) return docs[0]
  } catch (err) {
    console.error('Error fetching article from db:', err)
  }

  // Fallback to sample article by slug
  const sample = SAMPLE_ARTICLES.find((a) => a.slug === slug)
  return sample || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article: any = await getArticle(slug)
  if (!article) return { title: 'Not Found' }

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.publishedDate || undefined,
      authors: [article.author?.name || 'The Open Brief'],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article: any = await getArticle(slug)
  if (!article) notFound()

  const author = article.author as any
  const categories = (article.categories as any[]) || []

  return (
    <main className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 py-5 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="The Open Brief"
            className="h-9 w-auto object-contain"
          />
        </Link>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* ── Type tag ──────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            {article.type?.replace('-', ' ')}
          </span>
          {categories.map((cat: any) => (
            <span
              key={cat.id}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {cat.name}
            </span>
          ))}
          {article.isPremium && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              Premium
            </span>
          )}
        </div>

        {/* ── Headline ──────────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-6 tracking-tight">
          {article.title}
        </h1>

        {/* ── Byline ────────────────────────────────────────────────────── */}
        {article.excerpt && (
          <p className="text-xl text-gray-500 leading-relaxed mb-8 border-l-4 border-indigo-200 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-12 pb-8 border-b border-gray-100">
          <div>
            <span className="font-medium text-gray-700">{author?.name}</span>
            {author?.bio && <span className="text-gray-400"> · {author.bio.slice(0, 60)}…</span>}
          </div>
          {article.publishedDate && (
            <span>
              {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
          {article.readTime && <span>{article.readTime} min read</span>}
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="prose prose-lg prose-gray max-w-none text-gray-800 leading-relaxed space-y-6 text-base sm:text-lg">
          {typeof article.content === 'string' ? (
            article.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <p className="text-gray-600">{article.excerpt || 'Article content'}</p>
          )}
        </div>
      </article>
    </main>
  )
}
