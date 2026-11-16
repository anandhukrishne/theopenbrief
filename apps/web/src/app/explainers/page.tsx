import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function ExplainersPage() {
  const articles = await fetchArticles('explainers')

  const leadArticle = articles[0]
  const sideArticles = articles.slice(1, 4)
  const restArticles = articles.slice(4)

  return (
    <main className="min-h-screen">
      {/* ── Sub-header (Single Logo Only) ── */}
      <header className="border-b border-neutral-200 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-semibold tracking-wide uppercase text-neutral-600">
            <Link href="/journal" className="hover:text-black transition-colors">OpenBrief Plus</Link>
            <span className="text-black border-b-2 border-black pb-0.5">TOB Explainers</span>
            <Link href="/tech" className="hover:text-black transition-colors">TechnoBrief</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Section Masthead Banner */}
        <div className="mb-12 pb-6 border-b border-neutral-200">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3 font-semibold">
            Pillar 02 • Visual & Structural Analyses
          </div>
          <img src="/logo-tob-explainers.png" alt="TOB Explainers" className="h-9 sm:h-11 w-auto object-contain mb-3" />
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
            Unpacking the mental models, systems architecture, and mechanical realities of modern technology and society.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-mono text-xs">
              02
            </div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">No Explainers Yet</h3>
            <p className="text-neutral-500 text-sm">Visual breakdowns and system explainers will appear here once published.</p>
          </div>
        ) : (
          <>
            {/* Same fashion as Main Page: Lead + Side Desk */}
            {leadArticle && (
              <section className="pb-14 border-b border-neutral-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                  {/* Lead Explainer (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
                      <span className="w-2 h-2 rounded-full bg-neutral-900 inline-block"></span>
                      <span>Featured Breakdown</span>
                    </div>

                    <Link href={`/articles/${leadArticle.slug}`} className="group block space-y-3">
                      <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.12] text-neutral-900 group-hover:text-neutral-600 tracking-tight transition-colors">
                        {leadArticle.title}
                      </h1>

                      {leadArticle.excerpt && (
                        <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
                          {leadArticle.excerpt}
                        </p>
                      )}
                    </Link>

                    {leadArticle.coverImage && (
                      <Link href={`/articles/${leadArticle.slug}`} className="block overflow-hidden border border-neutral-200 my-4 group rounded-sm">
                        <img
                          src={leadArticle.coverImage}
                          alt={leadArticle.title}
                          className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </Link>
                    )}

                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 pt-2">
                      <span className="text-neutral-900 font-semibold">{leadArticle.authorName}</span>
                      <span>•</span>
                      <span>{new Date(leadArticle.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{leadArticle.readTime} min read</span>
                    </div>
                  </div>

                  {/* Side Desk (5 cols) */}
                  <div className="lg:col-span-5 lg:border-l lg:border-neutral-200 lg:pl-10 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-900">
                      <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-neutral-900">
                        Recent Deep Dives
                      </h2>
                    </div>

                    <div className="divide-y divide-neutral-200">
                      {sideArticles.map((art, idx) => (
                        <article key={art.id} className="py-5 first:pt-0 last:pb-0 group">
                          <span className="font-mono text-xs text-neutral-400 font-semibold block mb-1">
                            0{idx + 1}.
                          </span>
                          <Link href={`/articles/${art.slug}`} className="block">
                            <h3 className="text-xl sm:text-2xl font-bold leading-snug text-neutral-900 group-hover:text-neutral-600 transition-colors tracking-tight">
                              {art.title}
                            </h3>
                            {art.excerpt && (
                              <p className="text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                                {art.excerpt}
                              </p>
                            )}
                            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-400">
                              <span>{art.authorName}</span>
                              <span>•</span>
                              <span>{art.readTime} min</span>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Remaining Articles Grid */}
            {restArticles.length > 0 && (
              <section className="pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {restArticles.map((art) => (
                    <article key={art.id} className="p-8 border border-neutral-200 bg-white group hover:border-neutral-900 transition-all rounded-sm">
                      <div className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                        Architectural Breakdown
                      </div>
                      <Link href={`/articles/${art.slug}`}>
                        <h2 className="text-2xl font-bold leading-snug text-neutral-900 group-hover:text-neutral-600 transition-colors mb-3 tracking-tight">
                          {art.title}
                        </h2>
                        {art.excerpt && (
                          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            {art.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-4 border-t border-neutral-100">
                          <span>{art.authorName}</span>
                          <span className="font-semibold text-neutral-900 group-hover:translate-x-1 transition-transform">{art.readTime} min read →</span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
