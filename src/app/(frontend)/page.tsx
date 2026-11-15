import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import type { Article } from '../../payload-types'

// Revalidate homepage every 60 seconds (ISR)
export const revalidate = 60

async function getLatestArticles() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    limit: 12,
    depth: 1, // resolve author + categories
  })
  return docs
}

export default async function HomePage() {
  const articles = await getLatestArticles()

  const featured = articles[0]
  const rest = articles.slice(1)

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
        <nav className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/journal" className="hover:text-black transition-colors">Journal</Link>
          <Link href="/stories" className="hover:text-black transition-colors">Stories</Link>
          <Link href="/explainers" className="hover:text-black transition-colors">Explainers</Link>
          <Link href="/tech" className="hover:text-black transition-colors">Tech Bites</Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ── Featured ──────────────────────────────────────────────────── */}
        {featured && (
          <section className="mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 block">
              Featured
            </span>
            <Link href={`/articles/${featured.slug}`} className="group block">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight mb-4 group-hover:text-indigo-700 transition-colors">
                {featured.title}
              </h1>
              {featured.excerpt && (
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">{featured.excerpt}</p>
              )}
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                {typeof featured.author === 'object' && (
                  <span>{(featured.author as any)?.name}</span>
                )}
                {featured.publishedDate && (
                  <>
                    <span>·</span>
                    <span>{new Date(featured.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Latest
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function ArticleCard({ article }: { article: Article & { author: any; categories: any[] } }) {
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
      <h3 className="font-playfair text-xl font-bold leading-snug mb-2 group-hover:text-indigo-700 transition-colors">
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
