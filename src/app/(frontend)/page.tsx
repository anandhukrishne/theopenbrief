import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getLatestArticles() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'articles',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      limit: 12,
      depth: 1, // resolve author + categories
    })
    return docs
  } catch (err) {
    console.error('Error fetching latest articles:', err)
    return []
  }
}

import { SAMPLE_ARTICLES } from '@/lib/sampleArticles'

export default async function HomePage() {
  const dbArticles = await getLatestArticles()
  const articles = dbArticles && dbArticles.length > 0 ? dbArticles : SAMPLE_ARTICLES

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <main>
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
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-600 overflow-x-auto">
            <Link href="/journal" className="hover:text-black transition-colors whitespace-nowrap">Journal</Link>
            <Link href="/stories" className="hover:text-black transition-colors whitespace-nowrap">Stories</Link>
            <Link href="/explainers" className="hover:text-black transition-colors whitespace-nowrap">Explainers</Link>
            <Link href="/tech" className="hover:text-black transition-colors whitespace-nowrap">Tech Bites</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Featured ──────────────────────────────────────────────────── */}
        {featured && (
          <section className="mb-12 sm:mb-16 border-b border-gray-100 pb-12 sm:pb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 block">
              Featured Brief
            </span>
            <Link href={`/articles/${featured.slug}`} className="group block">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">
                {featured.title}
              </h1>
              {featured.excerpt && (
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mb-4">{featured.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                {typeof featured.author === 'object' && (
                  <span className="font-medium text-gray-700">{(featured.author as any)?.name}</span>
                )}
                {featured.publishedDate && (
                  <>
                    <span>·</span>
                    <span>{new Date(featured.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </>
                )}
                {featured.readTime && (
                  <>
                    <span>·</span>
                    <span>{featured.readTime} min read</span>
                  </>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* ── Article Grid ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Latest Dispatches
            </h2>
            <span className="text-xs text-gray-400">Updated weekly</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function ArticleCard({ article }: { article: any }) {
  const typeLabels: Record<string, string> = {
    'journal': '📔 Journal',
    'short-story': '📖 Story',
    'explainer': '🌐 Explainer',
    'tech-bite': '⚡ Tech',
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="mb-3">
        <span className="text-xs font-medium text-indigo-600">
          {typeLabels[article.type] || article.type}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{article.excerpt}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        {article.author?.name && <span>{article.author.name}</span>}
        {article.publishedDate && (
          <>
            <span>·</span>
            <span>
              {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </>
        )}
        {article.isPremium && (
          <>
            <span>·</span>
            <span className="text-amber-500 font-semibold">Premium</span>
          </>
        )}
      </div>
    </Link>
  )
}
