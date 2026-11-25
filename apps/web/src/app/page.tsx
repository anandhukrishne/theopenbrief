import Link from 'next/link'
import { fetchArticles, fetchEditions, Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'
import HomeNav from '@/components/HomeNav'
import SectionHeroBlock from '@/components/SectionHeroBlock'
import SectionTrioRow, { TrioPattern } from '@/components/SectionTrioRow'

export const revalidate = 3600

const SECTIONS_CONFIG = [
  { section: 'explainers', title: 'TOB Explainers', href: '/explainers', layout: 'featured-left', trio1: 'big-left', trio2: 'big-center' },
  { section: 'journal', title: 'OpenBrief Plus', href: '/journal', layout: 'featured-right', trio1: 'big-center', trio2: 'big-left' },
  { section: 'tech', title: 'TechnoBrief', href: '/tech', layout: 'featured-left', trio1: 'big-right', trio2: 'big-left' },
  { section: 'cinebrief', title: 'CinēBrief', href: '/cinebrief', layout: 'featured-right', trio1: 'big-center', trio2: 'big-right' },
  { section: 'general', title: 'General', href: '/general', layout: 'featured-left', trio1: 'big-left', trio2: 'big-center' },
] as const

function pickStoryOfTheDay(articles: Article[]): Article | null {
  if (articles.length === 0) return null
  // Prefer a recent flagship story (journal/explainers) with a cover image, else newest with cover, else newest
  const flagshipWithCover = articles.find(
    (a) => a.coverImage && (a.section === 'journal' || a.section === 'explainers')
  )
  if (flagshipWithCover) return flagshipWithCover

  const anyWithCover = articles.find((a) => Boolean(a.coverImage))
  return anyWithCover || articles[0]
}

export default async function HomePage() {
  const [allArticles, editions] = await Promise.all([
    fetchArticles(),
    fetchEditions(),
  ])

  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  // Track rendered article IDs so Story of the Day, Top Picks, and Section Strips never repeat
  const usedIds = new Set<string>()

  const heroArticle = pickStoryOfTheDay(allArticles)
  if (heroArticle) usedIds.add(heroArticle.id)

  // Top Picks: up to 4 distinct stories excluding Story of the Day (prefer diverse sections)
  const remainingAfterHero = allArticles.filter((a) => !usedIds.has(a.id))
  const topPicks: Article[] = []
  const pickedSections = new Set<string>()

  for (const art of remainingAfterHero) {
    if (topPicks.length >= 4) break
    if (!pickedSections.has(art.section)) {
      topPicks.push(art)
      pickedSections.add(art.section)
      usedIds.add(art.id)
    }
  }
  for (const art of remainingAfterHero) {
    if (topPicks.length >= 4) break
    if (!usedIds.has(art.id)) {
      topPicks.push(art)
      usedIds.add(art.id)
    }
  }

  // Detect any Special Edition dispatches (section === 'editions' or slug/section prefixed with edition)
  const editionArticles = allArticles.filter(
    (a) => (a.section as string) === 'editions' || a.slug.startsWith('edition-')
  )

  // Group articles by section excluding already-shown lead/top-pick stories (backfilling only if needed)
  const getSectionStream = (matcher: (a: Article) => boolean): Article[] => {
    const pool = allArticles.filter(matcher)
    const fresh = pool.filter((a) => !usedIds.has(a.id))
    const selected = fresh.slice(0, 7)
    selected.forEach((a) => usedIds.add(a.id))
    return selected
  }

  const sectionArticlesMap: Record<string, Article[]> = {
    explainers: getSectionStream((a) => a.section === 'explainers'),
    journal: getSectionStream((a) => a.section === 'journal'),
    tech: getSectionStream((a) => a.section === 'tech'),
    cinebrief: getSectionStream((a) => a.section === 'cinebrief'),
    general: getSectionStream((a) => a.section === 'general' || a.section === 'standalone'),
  }

  const renderSectionTrios = (articles: Article[], trio1Pattern: TrioPattern, trio2Pattern: TrioPattern) => {
    if (articles.length <= 3) return null

    const trio1 = articles.slice(3, 6)
    const trio2 = articles.slice(6, 7)

    return (
      <div className="space-y-2">
        {trio1.length > 0 && <SectionTrioRow articles={trio1} pattern={trio1Pattern} />}
        {trio2.length > 0 && <SectionTrioRow articles={trio2} pattern={trio2Pattern} />}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Top Masthead Header ── */}
      <div className="border-b border-neutral-300 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-sans text-neutral-600 dark:text-neutral-400 font-medium">
          <div className="w-full md:w-1/4 text-center md:text-left">
            {dateFormatted}
          </div>
          <div className="w-full md:w-2/4 flex items-center justify-center px-6 py-1">
            <Link href="/" className="inline-block py-1">
              <img
                src="/logo.png"
                alt="TheOpenBrief.app"
                className="h-8 sm:h-9 w-auto object-contain dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="TheOpenBrief.app"
                className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
              />
            </Link>
          </div>
          <div className="hidden md:flex w-full md:w-1/4 items-center justify-end gap-4 text-right font-medium">
            <Link
              href="/editions"
              className="text-[11px] font-sans font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline"
            >
              Special Editions
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Editorial Navigation Bar ── */}
      <HomeNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Special Edition Spotlight Banner (Auto-renders when Editions exist) ── */}
        {editions.length > 0 ? (
          <div className="mt-6 p-4 sm:px-6 sm:py-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-neutral-800 dark:border-neutral-200">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 dark:text-red-600 font-bold block">
                {editions[0].badgeText || 'Special Commemorative Issue'}
              </span>
              <p className="text-sm sm:text-base font-bold font-serif tracking-tight">
                {editions[0].title} {editions[0].subtitle && `— ${editions[0].subtitle}`}
              </p>
            </div>
            <Link
              href={`/editions/${editions[0].slug}`}
              prefetch={false}
              className="text-xs font-mono uppercase tracking-wider font-bold px-3.5 py-2 bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white hover:opacity-90 transition-opacity shrink-0"
            >
              Open Special Edition →
            </Link>
          </div>
        ) : editionArticles.length > 0 ? (
          <div className="mt-6 p-4 sm:px-6 sm:py-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 dark:text-red-600 font-bold block">
                Special Commemorative Issue • {editionArticles.length} {editionArticles.length === 1 ? 'Dispatch' : 'Dispatches'}
              </span>
              <p className="text-sm sm:text-base font-bold tracking-tight">
                {editionArticles[0].title}
              </p>
            </div>
            <Link
              href="/editions"
              prefetch={false}
              className="text-xs font-mono uppercase tracking-wider font-bold px-3.5 py-2 bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white hover:opacity-90 transition-opacity shrink-0"
            >
              Open Special Edition →
            </Link>
          </div>
        ) : null}

        {/* ── EMPTY STATE ── */}
        {allArticles.length === 0 && (
          <section className="py-20 sm:py-32 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-2xl tracking-tight">
              TOB
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              The newsroom is quiet.
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              No articles have been published yet. Check back soon for explainers, essays, and reviews.
            </p>
          </section>
        )}

        {/* ── Top Publication Lead: Story of the Day & Top Picks ── */}
        {heroArticle && (
          <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left Side: Story of the day */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-[10px] font-bold text-red-600 dark:text-red-500 uppercase tracking-widest font-sans">
                  Story of the day · {heroArticle.section.toUpperCase()}
                </div>

                <Link href={`/articles/${heroArticle.slug}`} prefetch={false} className="group block">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    {heroArticle.title}
                  </h1>
                  {heroArticle.excerpt && (
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                      {heroArticle.excerpt}
                    </p>
                  )}
                </Link>

                <Link
                  href={`/articles/${heroArticle.slug}`}
                  prefetch={false}
                  className="block relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden group"
                >
                  <CoverImage
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    monogramSize="lg"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </Link>
              </div>

              {/* Right Side: Top Picks (Strictly distinct from Story of the Day) */}
              <div className="lg:col-span-5 space-y-2">
                <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  Top Picks of the day
                </h2>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {topPicks.map((pick, i) => (
                    <div key={pick.id || i} className="py-3.5 first:pt-2 last:pb-0 flex gap-3.5 items-start">
                      <Link
                        href={`/articles/${pick.slug}`}
                        prefetch={false}
                        className="w-20 h-20 shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden"
                      >
                        <CoverImage
                          src={pick.coverImage}
                          alt={pick.title}
                          monogramSize="sm"
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-sans font-bold uppercase text-red-600 dark:text-red-400 block">
                          {pick.section}
                        </span>
                        <Link href={`/articles/${pick.slug}`} prefetch={false}>
                          <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            {pick.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/authors/${getAuthorSlug(pick.authorName)}`}
                          prefetch={false}
                          className="text-[11px] text-neutral-500 dark:text-neutral-400 italic truncate hover:underline hover:text-red-600 dark:hover:text-red-400 block transition-colors"
                        >
                          {pick.authorName}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Editorial Section Streams (1+3+3=7 Architecture, Zero Duplicates) ── */}
        {SECTIONS_CONFIG.map(({ section, title, href, layout, trio1, trio2 }) => {
          const articles = sectionArticlesMap[section] || []
          if (articles.length === 0) return null

          return (
            <div key={section} className="space-y-0">
              <SectionHeroBlock
                section={section}
                title={title}
                href={href}
                layout={layout}
                articles={articles}
              />
              {renderSectionTrios(articles, trio1, trio2)}
            </div>
          )
        })}
      </div>
    </main>
  )
}