import Link from 'next/link'
import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function ExplainerPage() {
  const articles = await fetchArticles('explainer')

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Open Brief" className="h-7 sm:h-9 w-auto object-contain" />
          </Link>
          <img src="/logo-tob-explainers.png" alt="TOB Explainers" className="h-6 sm:h-7 w-auto object-contain" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <img src="/logo-tob-explainers.png" alt="TOB Explainers" className="h-8 sm:h-10 w-auto object-contain mb-3" />
          <p className="text-gray-500 text-base sm:text-lg">Visual breakdowns and clarity on complex subjects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article: any) => (
            <article key={article.id} className="border border-gray-100 p-6 rounded-lg group hover:border-indigo-100 transition-colors">
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl font-bold group-hover:text-indigo-600 transition-colors mb-2">
                  {article.title}
                </h2>
                {article.excerpt && <p className="text-gray-500 text-sm mb-4 leading-relaxed">{article.excerpt}</p>}
                <div className="text-xs text-gray-400">
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.readTime && <span> · {article.readTime} min read</span>}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
