import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function ExplainersPage() {
  const articles = await fetchArticles('explainers')

  return (
    <main className="min-h-screen">
      {/* ── Clean Header (Single Logo Only) ── */}
      <header className="border-b border-neutral-200 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-neutral-600">
            <Link href="/journal" className="hover:text-black transition-colors">OpenBrief Plus</Link>
            <span className="text-black font-semibold border-b-2 border-black pb-0.5">TOB Explainers</span>
            <Link href="/tech" className="hover:text-black transition-colors">TechnoBrief</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-12 pb-8 border-b border-neutral-200">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
            Section 02 • Visual & Structural Analyses
          </div>
          <img src="/logo-tob-explainers.png" alt="TOB Explainers" className="h-9 sm:h-11 w-auto object-contain mb-4" />
          <p className="editorial-serif text-lg sm:text-xl text-neutral-600 italic leading-relaxed max-w-2xl">
            Unpacking the mental models, systems architecture, and mechanical realities of modern technology and society.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="p-8 border border-neutral-200 bg-white group hover:border-neutral-900 transition-all rounded-sm">
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                Architectural Breakdown
              </div>
              <Link href={`/articles/${article.slug}`}>
                <h2 className="editorial-serif text-2xl font-bold leading-snug text-neutral-900 group-hover:text-neutral-600 transition-colors mb-3">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-4 border-t border-neutral-100">
                  <span>{article.authorName}</span>
                  <span className="font-semibold text-neutral-900 group-hover:translate-x-1 transition-transform">{article.readTime} min read →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
