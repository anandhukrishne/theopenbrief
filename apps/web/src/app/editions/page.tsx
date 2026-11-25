import Link from 'next/link'
import { fetchArticles, Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import SiteHeader from '@/components/SiteHeader'
import CoverImage from '@/components/CoverImage'

export const revalidate = 3600

export const metadata = {
  title: 'Special Editions | The Open Brief',
  description: 'Curated commemorative issues, seasonal digests, and special reports from The Open Brief newsroom.',
}

interface EditionGroup {
  slug: string
  title: string
  subtitle: string
  articles: Article[]
}

function groupEditions(articles: Article[]): EditionGroup[] {
  const editionPosts = articles.filter(
    (a) => a.section === 'editions' || a.slug.startsWith('edition-')
  )

  const groupsMap = new Map<string, EditionGroup>()

  for (const art of editionPosts) {
    // Slug convention: edition-christmas-2026-story-title -> group key "christmas-2026"
    const match = art.slug.match(/^edition-([a-z0-9]+-(?:20\d{2}|special|issue|day))-(.+)$/i)
    const key = match ? match[1].toLowerCase() : 'special-issue'
    const label = match
      ? match[1]
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') + ' Edition'
      : 'Special Commemorative Edition'

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        slug: key,
        title: label,
        subtitle: 'Curated dispatches, essays, and visual explainers from the editorial desk.',
        articles: [],
      })
    }
    groupsMap.get(key)!.articles.push(art)
  }

  return Array.from(groupsMap.values())
}

export default async function EditionsPage() {
  const allArticles = await fetchArticles()
  const editions = groupEditions(allArticles)

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section="editions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Masthead Banner */}
        <div className="pb-6 mb-10 border-b-2 border-neutral-900 dark:border-neutral-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-bold block mb-1">
              The Open Brief • Commemorative Issues
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Special Editions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
            Themed print-inspired digital issues produced for national milestones, seasonal retrospectives, and deep-dive investigations.
          </p>
        </div>

        {editions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 dark:border-neutral-800 p-8 max-w-xl mx-auto my-8 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              Upcoming Issues
            </span>
            <h2 className="text-xl font-bold">No Special Editions Published Yet</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Publish an article under the <strong>Special Edition</strong> section (or prefix its slug with <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5">edition-christmas-2026-</code> or <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5">edition-republic-day-</code>) in Author Studio to launch an issue here.
            </p>
            <Link
              href="/"
              className="inline-block pt-2 text-xs font-sans font-bold uppercase tracking-wider underline hover:text-red-600"
            >
              ← Return to Front Page
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {editions.map((edition) => {
              const [lead, ...rest] = edition.articles
              return (
                <section
                  key={edition.slug}
                  id={edition.slug}
                  className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0D131F] p-5 sm:p-8 space-y-8"
                >
                  {/* Edition Header */}
                  <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-bold">
                        Special Issue • {edition.articles.length} {edition.articles.length === 1 ? 'Story' : 'Stories'}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                        {edition.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">
                      {new Date(lead.publishedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Lead Story + Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <article className="lg:col-span-7 space-y-3">
                      <Link href={`/articles/${lead.slug}`} prefetch={false} className="group block space-y-3">
                        <div className="w-full aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                          <CoverImage
                            src={lead.coverImage}
                            alt={lead.title}
                            monogramSize="lg"
                            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                          />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {lead.title}
                        </h3>
                      </Link>
                      {lead.excerpt && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {lead.excerpt}
                        </p>
                      )}
                      <div className="text-xs font-sans text-neutral-500">
                        <Link href={`/authors/${getAuthorSlug(lead.authorName)}`} prefetch={false} className="hover:underline">
                          {lead.authorName}
                        </Link>{' '}
                        • {lead.readTime} min read
                      </div>
                    </article>

                    <div className="lg:col-span-5 divide-y divide-neutral-200 dark:divide-neutral-800">
                      {rest.length === 0 ? (
                        <p className="text-xs font-mono text-neutral-400 py-4">
                          Lead feature for {edition.title}. Add more dispatches with slug prefix <code className="underline">edition-{edition.slug}-</code> to expand this issue.
                        </p>
                      ) : (
                        rest.map((art) => (
                          <article key={art.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-start">
                            <Link
                              href={`/articles/${art.slug}`}
                              prefetch={false}
                              className="w-24 aspect-[4/3] shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                            >
                              <CoverImage
                                src={art.coverImage}
                                alt={art.title}
                                monogramSize="sm"
                                className="w-full h-full object-cover"
                              />
                            </Link>
                            <div className="space-y-1 min-w-0">
                              <Link href={`/articles/${art.slug}`} prefetch={false}>
                                <h4 className="text-base font-bold leading-snug line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                  {art.title}
                                </h4>
                              </Link>
                              <p className="text-[11px] text-neutral-500">
                                {art.authorName} • {art.readTime} min read
                              </p>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}