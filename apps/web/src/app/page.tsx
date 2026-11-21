import Link from 'next/link'
import { fetchArticles, Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'
import HomeNav from '@/components/HomeNav'
import SectionHeroBlock from '@/components/SectionHeroBlock'
import SectionTrioRow, { TrioPattern } from '@/components/SectionTrioRow'

export const revalidate = 60

const SECTIONS_CONFIG = [
  { section: 'explainers', title: 'TOB Explainers', href: '/explainers', layout: 'featured-left', trio1: 'big-left', trio2: 'big-center' },
  { section: 'journal', title: 'OpenBrief Plus', href: '/journal', layout: 'featured-right', trio1: 'big-center', trio2: 'big-left' },
  { section: 'tech', title: 'TechnoBrief', href: '/tech', layout: 'featured-left', trio1: 'big-right', trio2: 'big-left' },
  { section: 'cinebrief', title: 'CinēBrief', href: '/cinebrief', layout: 'featured-right', trio1: 'big-center', trio2: 'big-right' },
  { section: 'general', title: 'General', href: '/general', layout: 'featured-left', trio1: 'big-left', trio2: 'big-center' },
] as const

export default async function HomePage() {
  const allArticles = await fetchArticles()

  // Date formatted like in the mockup
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const heroArticle = allArticles[0] || null
  const topPicks = allArticles.slice(0, 4)

  // Group articles by section
  const sectionArticlesMap: Record<string, Article[]> = {
    explainers: allArticles.filter((a) => a.section === 'explainers').slice(0, 7),
    journal: allArticles.filter((a) => a.section === 'journal').slice(0, 7),
    tech: allArticles.filter((a) => a.section === 'tech').slice(0, 7),
    cinebrief: allArticles.filter((a) => a.section === 'cinebrief').slice(0, 7),
    general: allArticles.filter((a) => a.section === 'general' || a.section === 'standalone').slice(0, 7),
  }

  // Helper to render remaining articles for a section in 1+3+3=7 architecture
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
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Editorial Navigation Bar ── */}
      <HomeNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── EMPTY STATE: When no articles exist ── */}
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

                <Link href={`/articles/${heroArticle.slug}`} className="group block">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    {heroArticle.title}
                  </h1>
                  {heroArticle.excerpt && (
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                      {heroArticle.excerpt}
                    </p>
                  )}
                </Link>

                {/* Cover Box with Fallback */}
                <Link
                  href={`/articles/${heroArticle.slug}`}
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

              {/* Right Side: Top Picks */}
              <div className="lg:col-span-5 space-y-2">
                <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  Top Picks of the day
                </h2>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {topPicks.map((pick, i) => (
                    <div key={pick.id || i} className="py-3.5 first:pt-2 last:pb-0 flex gap-3.5 items-start">
                      <Link
                        href={`/articles/${pick.slug}`}
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
                        <Link href={`/articles/${pick.slug}`}>
                          <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            {pick.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/authors/${getAuthorSlug(pick.authorName)}`}
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

        {/* ── Editorial Section Streams (1+3+3=7 Architecture) ── */}
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