import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchArticleBySlug } from '@/lib/api'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article: any = await fetchArticleBySlug(slug)
  if (!article) return { title: 'Not Found — The Open Brief' }

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
  const article: any = await fetchArticleBySlug(slug)
  if (!article) notFound()

  const author = article.author as any
  const categories = (article.categories as any[]) || []

  return (
    <main className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4 text-xs sm:text-sm font-medium text-gray-600">
            <Link href="/journal" className="hover:text-black">Journal</Link>
            <Link href="/stories" className="hover:text-black">Stories</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* ── Type tag ──────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            {article.type?.replace('-', ' ')}
          </span>
          {categories.map((cat: any) => (
            <span
              key={cat.id || cat.name}
              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full"
            >
              {cat.name}
            </span>
          ))}
        </div>

        {/* ── Headline ──────────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-6 tracking-tight">
          {article.title}
        </h1>

        {/* ── Byline ────────────────────────────────────────────────────── */}
        {article.excerpt && (
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 border-l-2 border-indigo-400 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 mb-12 pb-8 border-b border-gray-100">
          <div>
            <span className="font-semibold text-gray-800">{author?.name}</span>
            {author?.bio && <span className="text-gray-400"> · {author.bio}</span>}
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
          {article.readTime && <span>· {article.readTime} min read</span>}
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="text-gray-800 leading-relaxed space-y-6 text-base sm:text-lg">
          {typeof article.content === 'string' ? (
            article.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <p className="text-gray-600">{article.excerpt}</p>
          )}
        </div>
      </article>
    </main>
  )
}
