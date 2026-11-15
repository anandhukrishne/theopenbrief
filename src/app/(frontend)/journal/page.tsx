import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getArticlesByType(type: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { status: { equals: 'published' } },
          { type: { equals: type } },
        ],
      },
      sort: '-publishedDate',
      limit: 20,
      depth: 1,
    })
    return docs
  } catch (err) {
    console.error(`Error fetching articles for type ${type}:`, err)
    return []
  }
}

export default async function JournalPage() {
  const articles = await getArticlesByType('journal')

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 py-5 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="The Open Brief"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Journal & Essays
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-playfair text-4xl font-bold mb-3">The Journal</h1>
        <p className="text-gray-500 mb-12 text-lg">In-depth essays, deep dives, and reflective analyses.</p>

        <div className="divide-y divide-gray-100">
          {articles.length === 0 ? (
            <p className="text-gray-400 italic py-8">No journal articles published yet.</p>
          ) : (
            articles.map((article: any) => (
              <article key={article.id} className="py-8 group">
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="font-playfair text-2xl font-bold group-hover:text-indigo-600 transition-colors mb-2">
                    {article.title}
                  </h2>
                  {article.excerpt && <p className="text-gray-500 mb-3">{article.excerpt}</p>}
                  <div className="text-xs text-gray-400 flex gap-3">
                    {article.author?.name && <span>{article.author.name}</span>}
                    {article.readTime && <span>· {article.readTime} min read</span>}
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
