import Link from 'next/link'
import { fetchArticlesByAuthor } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'
import CoverImage from '@/components/CoverImage'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ author: string }>
}

export const revalidate = 60

export default async function AuthorProfilePage({ params }: Props) {
  const { author } = await params
  const decodedAuthor = decodeURIComponent(author)
  const articles = await fetchArticlesByAuthor(decodedAuthor)

  // Use author details from the first matching article or decoded slug
  const authorName = articles[0]?.authorName || decodedAuthor.replace(/-/g, ' ')
  const authorBio = articles[0]?.authorBio || 'Staff Author & Contributor at The Open Brief.'
  const authorAvatar = articles[0]?.authorAvatar

  const authorInitials = authorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TOB'

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Standardized Responsive Site Header ── */}
      <SiteHeader section={null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Author Header Banner (Editorial Unboxed Style) */}
        <div className="mb-14 pb-8 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Author Photo or Monogram */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-neutral-800 flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 select-none shadow-sm">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                authorInitials
              )}
            </div>

            <div className="space-y-2">
              <div className="font-sans text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 font-bold">
                Author &amp; Contributor
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight capitalize text-neutral-900 dark:text-neutral-50">
                {authorName}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
                {authorBio}
              </p>
              <div className="pt-1 font-sans text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {articles.length} {articles.length === 1 ? 'Article' : 'Articles'} Published
              </div>
            </div>
          </div>
        </div>

        {/* Author Articles Grid */}
        <div>
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-500 mb-6">
            Articles by {authorName}
          </h2>

          {articles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-8 max-w-md mx-auto">
              <p className="text-sm text-neutral-500 leading-relaxed">
                No articles published by this author yet.
              </p>
              <div className="mt-4">
                <Link href="/" className="text-xs font-sans font-bold text-neutral-900 dark:text-neutral-100 underline">
                  ← Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((art) => (
                <article
                  key={art.id}
                  className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 rounded-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {art.coverImage && (
                      <Link href={`/articles/${art.slug}`} className="block mb-3 aspect-[16/9] w-full overflow-hidden rounded-xs border border-neutral-200 dark:border-neutral-800">
                        <CoverImage src={art.coverImage} alt={art.title} monogramSize="md" className="w-full h-full object-cover" />
                      </Link>
                    )}
                    <span className="text-[10px] font-sans uppercase font-bold text-red-600 dark:text-red-400 block mb-1">
                      {art.section}
                    </span>
                    <Link href={`/articles/${art.slug}`}>
                      <h3 className="text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                        {art.title}
                      </h3>
                    </Link>
                    {art.excerpt && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-sans text-neutral-500 dark:text-neutral-400 flex items-center justify-between font-medium">
                    <span>
                      {new Date(art.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>{art.readTime} min read</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
