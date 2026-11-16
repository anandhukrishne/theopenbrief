import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function StoriesPage() {
  const articles = await fetchArticles('short-story')

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Open Brief" className="h-7 sm:h-9 w-auto object-contain" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Fiction & Stories
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Short Stories</h1>
        <p className="text-gray-500 mb-12 text-base sm:text-lg">Narrative fiction, character studies, and speculative prose.</p>

        <div className="divide-y divide-gray-100">
          {articles.map((article: any) => (
            <article key={article.id} className="py-8 group">
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl sm:text-2xl font-bold group-hover:text-indigo-600 transition-colors mb-2">
                  {article.title}
                </h2>
                {article.excerpt && <p className="text-gray-500 mb-3 text-sm sm:text-base leading-relaxed">{article.excerpt}</p>}
                <div className="text-xs text-gray-400 flex gap-3">
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.readTime && <span>· {article.readTime} min read</span>}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
