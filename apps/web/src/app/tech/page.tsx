import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function TechPage() {
  const articles = await fetchArticles('tech')

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
          </Link>
          <img src="/logo-technobrief.png" alt="TechnoBrief" className="h-6 w-auto object-contain" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-12 pb-8 border-b-2 border-neutral-900">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
            Section 03 • Engineering Intelligence
          </div>
          <img src="/logo-technobrief.png" alt="TechnoBrief" className="h-10 sm:h-12 w-auto object-contain mb-4" />
          <p className="editorial-serif text-lg sm:text-xl text-neutral-600 italic leading-relaxed max-w-2xl">
            Dense, fast-paced technical bites examining distributed protocols, kernel abstractions, and modern engineering patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="p-6 border border-neutral-200 bg-white group hover:border-neutral-900 transition-colors flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                  ⚡ Byte
                </div>
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="font-sans font-bold text-lg leading-snug text-neutral-900 group-hover:text-neutral-600 transition-colors mb-3">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-xs text-neutral-600 leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>{article.authorName}</span>
                <span className="font-semibold text-neutral-900">{article.readTime}m read</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
