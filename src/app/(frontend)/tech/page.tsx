import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { SAMPLE_ARTICLES } from '@/lib/sampleArticles'

export const dynamic = 'force-dynamic'

async function getTechBites() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { status: { equals: 'published' } },
          { type: { equals: 'tech-bite' } },
        ],
      },
      sort: '-publishedDate',
      limit: 20,
      depth: 1,
    })
    if (docs && docs.length > 0) return docs
  } catch (err) {
    console.error('Error fetching tech bites:', err)
  }
  return SAMPLE_ARTICLES.filter((a) => a.type === 'tech-bite')
}

export default async function TechPage() {
  const articles = await getTechBites()

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Open Brief" className="h-7 sm:h-9 w-auto object-contain" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Technical Bites
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Tech Bites</h1>
        <p className="text-gray-500 mb-12 text-base sm:text-lg">Short, dense breakdowns of systems, architecture, and protocols.</p>

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
