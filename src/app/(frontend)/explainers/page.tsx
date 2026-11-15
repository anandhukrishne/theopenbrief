import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

export const revalidate = 60

async function getArticlesByType(type: string) {
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
}

export default async function ExplainerPage() {
  const articles = await getArticlesByType('explainer')

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
          Web Explainers
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-playfair text-4xl font-bold mb-3">Explainers</h1>
        <p className="text-gray-500 mb-12 text-lg">Visual breakdowns and clarity on complex subjects.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.length === 0 ? (
            <p className="text-gray-400 italic py-8">No explainers published yet.</p>
          ) : (
            articles.map((article: any) => (
              <article key={article.id} className="border border-gray-100 p-6 rounded-lg group hover:border-indigo-100 transition-colors">
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="font-playfair text-xl font-bold group-hover:text-indigo-600 transition-colors mb-2">
                    {article.title}
                  </h2>
                  {article.excerpt && <p className="text-gray-500 text-sm mb-4 line-clamp-3">{article.excerpt}</p>}
                  <div className="text-xs text-gray-400">
                    {article.author?.name && <span>{article.author.name}</span>}
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
