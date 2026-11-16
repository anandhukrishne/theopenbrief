import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const articles = await fetchArticles('journal')

  return (
    <main className="min-h-screen">
      {/* ── Sub-header ── */}
      <header className="border-b border-neutral-200 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-6">
            <img src="/logo-openbrief-plus.png" alt="OpenBrief Plus" className="h-6 w-auto object-contain" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-12 pb-8 border-b-2 border-neutral-900">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
            Section 01 • Long-Form Essays
          </div>
          <img src="/logo-openbrief-plus.png" alt="OpenBrief Plus" className="h-10 sm:h-12 w-auto object-contain mb-4" />
          <p className="editorial-serif text-lg sm:text-xl text-neutral-600 italic leading-relaxed max-w-2xl">
            A salon for cultural analysis, philosophical inquiry, and deep long-form essays that reward sustained attention.
          </p>
        </div>

        <div className="space-y-12">
          {articles.map((article, idx) => (
            <article key={article.id} className="group border-b border-neutral-200 pb-12 last:border-0">
              <div className="flex items-baseline gap-2 mb-2 font-mono text-xs text-neutral-400">
                <span>Dispatch {String(idx + 1).padStart(2, '0')}</span>
                <span>•</span>
                <span>{new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <Link href={`/articles/${article.slug}`} className="block">
                <h2 className="editorial-serif text-2xl sm:text-4xl font-bold leading-tight text-neutral-900 group-hover:text-neutral-600 transition-colors mb-3">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="editorial-serif text-base sm:text-lg text-neutral-600 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                  <span className="font-semibold text-neutral-800">{article.authorName}</span>
                  <span>•</span>
                  <span>{article.readTime} min read</span>
                  <span className="ml-auto text-neutral-900 font-semibold group-hover:translate-x-1 transition-transform">Read Essay →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
