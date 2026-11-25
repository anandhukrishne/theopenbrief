import Link from 'next/link'
import { fetchEditions, fetchArticles, Edition, Article } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'

export const revalidate = 3600

export const metadata = {
  title: 'Special Editions | The Open Brief',
  description: 'Curated commemorative issues, seasonal digests, and special reports from The Open Brief newsroom.',
}

function getThemeAccent(preset: string) {
  switch (preset) {
    case 'christmas':
      return {
        badge: 'bg-red-700 text-white',
        border: 'hover:border-red-600 dark:hover:border-red-500',
        text: 'text-red-700 dark:text-red-400',
        tag: 'Christmas Edition',
      }
    case 'republic':
      return {
        badge: 'bg-blue-800 text-white',
        border: 'hover:border-blue-600 dark:hover:border-blue-500',
        text: 'text-blue-800 dark:text-blue-400',
        tag: 'Republic Day Special',
      }
    case 'heritage':
      return {
        badge: 'bg-amber-800 text-white',
        border: 'hover:border-amber-600 dark:hover:border-amber-500',
        text: 'text-amber-800 dark:text-amber-400',
        tag: 'Heritage Retrospective',
      }
    case 'monsoon':
      return {
        badge: 'bg-teal-800 text-white',
        border: 'hover:border-teal-600 dark:hover:border-teal-500',
        text: 'text-teal-800 dark:text-teal-400',
        tag: 'Monsoon Literary Issue',
      }
    case 'midnight':
      return {
        badge: 'bg-cyan-600 text-black font-extrabold',
        border: 'hover:border-cyan-500 dark:hover:border-cyan-400',
        text: 'text-cyan-600 dark:text-cyan-400',
        tag: 'Frontier Tech Special',
      }
    case 'classic':
    default:
      return {
        badge: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
        border: 'hover:border-neutral-900 dark:hover:border-neutral-100',
        text: 'text-neutral-900 dark:text-neutral-100',
        tag: 'Special Issue',
      }
  }
}

export default async function EditionsPage() {
  const [editions, allArticles] = await Promise.all([
    fetchEditions(),
    fetchArticles(),
  ])

  // Fallback: if no managed editions exist in database yet, assemble synthetic editions from tagged articles
  let displayEditions = editions
  if (displayEditions.length === 0) {
    const editionPosts = allArticles.filter(
      (a) => a.section === 'editions' || a.slug.startsWith('edition-')
    )

    const groupsMap = new Map<string, { slug: string; title: string; subtitle: string; count: number; date: string }>()
    for (const art of editionPosts) {
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
          count: 0,
          date: art.publishedDate,
        })
      }
      groupsMap.get(key)!.count += 1
    }

    displayEditions = Array.from(groupsMap.values()).map((g) => ({
      id: g.slug,
      title: g.title,
      slug: g.slug,
      subtitle: g.subtitle,
      description: '',
      themePreset: g.slug.includes('christmas')
        ? 'christmas'
        : g.slug.includes('republic')
        ? 'republic'
        : 'classic',
      badgeText: 'COMMEMORATIVE ISSUE',
      status: 'published',
      articleIds: [],
      publishedDate: g.date,
    }))
  }

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section="editions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Masthead Banner */}
        <div className="pb-6 border-b-2 border-neutral-900 dark:border-neutral-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-bold block mb-1">
              The Open Brief • Commemorative Issues &amp; Special Publications
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif">
              Special Editions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
            Themed print-inspired digital issues produced for milestones, seasonal retrospectives, and deep investigations.
          </p>
        </div>

        {displayEditions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 dark:border-neutral-800 p-8 max-w-xl mx-auto space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              Upcoming Issues
            </span>
            <h2 className="text-xl font-bold font-serif">No Special Editions Published Yet</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Launch and curate commemorative issues (such as the Christmas Edition or Republic Day Special) from the Editorial Studio.
            </p>
            <Link
              href="/"
              className="inline-block pt-2 text-xs font-sans font-bold uppercase tracking-wider underline hover:text-red-600"
            >
              ← Return to Front Page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayEditions.map((ed) => {
              const theme = getThemeAccent(ed.themePreset)
              const dateStr = new Date(ed.publishedDate).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })

              return (
                <Link
                  key={ed.id}
                  href={`/editions/${ed.slug}`}
                  className={`group block border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0D131F] rounded-xs overflow-hidden transition-all duration-300 ${theme.border} hover:shadow-lg flex flex-col justify-between`}
                >
                  <div>
                    {/* Cover Banner or Themed Header Block */}
                    {ed.coverImage ? (
                      <div className="w-full aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <img
                          src={ed.coverImage}
                          alt={ed.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-900/60 p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-2xl font-serif font-extrabold text-neutral-300 dark:text-neutral-700">
                          TOB
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {dateStr}
                        </span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-extrabold rounded-xs ${theme.badge}`}>
                          {ed.badgeText || theme.tag}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {dateStr}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {ed.title}
                      </h2>

                      {ed.subtitle && (
                        <p className="text-xs sm:text-sm font-serif text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {ed.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">
                      Explore Issue
                    </span>
                    <span className="font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      Open Edition →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
