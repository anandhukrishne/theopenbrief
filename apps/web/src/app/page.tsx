import Link from 'next/link'
import { fetchArticles, Article } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allArticles = await fetchArticles()

  // Date formatted like in the mockup
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const weekNumber = Math.ceil(
    (Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7
  )

  const heroArticle = allArticles[0] || null
  const topPicks = allArticles.slice(0, 4)
  const secondaryLead = allArticles[1] || null

  const journalArticles = allArticles.filter((a) => a.section === 'journal')
  const techArticles = allArticles.filter((a) => a.section === 'tech')
  const cineArticles = allArticles.filter((a) => a.section === 'cinebrief')
  const explainerArticles = allArticles.filter((a) => a.section === 'explainers')

  // For the explainer sidebar picks
  const explainerPicks = [...explainerArticles, ...techArticles].slice(0, 2)

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Top Masthead Header ── */}
      <div className="border-b border-neutral-300 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <div className="w-full md:w-1/4 text-center md:text-left font-medium">
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
          <div className="w-full md:w-1/4 flex items-center justify-center md:justify-end gap-4 text-center md:text-right font-medium">
            <span>Global edition | Week {weekNumber}</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Editorial Navigation Bar ── */}
      <nav className="border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0B101B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-bold tracking-wider uppercase overflow-x-auto text-neutral-800 dark:text-neutral-200">
          <Link href="/journal" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            OPENBRIEF PLUS
          </Link>
          <Link href="/explainers" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            TOB EXPLAINERS
          </Link>
          <Link href="/tech" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            TECHNOBRIEF
          </Link>
          <Link href="/cinebrief" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            CINĒBRIEF
          </Link>
          <Link href="/general" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            GENERAL
          </Link>
          <Link href="/about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap text-neutral-400">
            ABOUT
          </Link>
        </div>
      </nav>

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

        {/* ── Section 1 / Hero: Story of the Day & Top Picks ── */}
        {heroArticle && (
          <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left Side: Story of the day */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-[10px] font-bold text-red-600 dark:text-red-500 uppercase tracking-widest font-mono">
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
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-200 dark:border-neutral-800">
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
                        <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                          {pick.section}
                        </span>
                        <Link href={`/articles/${pick.slug}`}>
                          <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            {pick.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/authors/${encodeURIComponent(pick.authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`}
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

        {/* ── Section 2: Featured Secondary & Explainer Picks ── */}
        {secondaryLead && (
          <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-7 space-y-3">
                <Link
                  href={`/articles/${secondaryLead.slug}`}
                  className="block relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden group"
                >
                  <CoverImage
                    src={secondaryLead.coverImage}
                    alt={secondaryLead.title}
                    monogramSize="lg"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </Link>

                <Link href={`/articles/${secondaryLead.slug}`} className="block group">
                  <h2 className="text-xl sm:text-3xl font-extrabold leading-snug tracking-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    {secondaryLead.title}
                  </h2>
                  {secondaryLead.excerpt && (
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                      {secondaryLead.excerpt}
                    </p>
                  )}
                </Link>
              </div>

              <div className="lg:col-span-5 relative space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    Top Picks of the day
                  </span>
                  <Link href="/explainers">
                    <img
                      src="/logo-tob-explainers.png"
                      alt="TOB Explainers"
                      className="h-6 sm:h-7 w-auto object-contain dark:hidden"
                    />
                    <img
                      src="/logo-tob-explainers-white.png"
                      alt="TOB Explainers"
                      className="h-6 sm:h-7 w-auto object-contain hidden dark:block"
                    />
                  </Link>
                </div>

                {/* Subtle watermark */}
                <div className="absolute right-0 top-6 w-44 h-44 pointer-events-none opacity-[0.06] dark:opacity-[0.04] z-0 select-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 dark:text-white fill-current">
                    <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-4">
                  {explainerPicks.length > 0 ? explainerPicks.map((pick, i) => (
                    <div key={pick.id || i} className="p-3 bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm flex gap-3.5 items-start">
                      <Link
                        href={`/articles/${pick.slug}`}
                        className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden"
                      >
                        <CoverImage
                          src={pick.coverImage}
                          alt={pick.title}
                          monogramSize="sm"
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                          {pick.section}
                        </span>
                        <Link href={`/articles/${pick.slug}`}>
                          <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            {pick.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/authors/${encodeURIComponent(pick.authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`}
                          className="text-[11px] text-neutral-500 dark:text-neutral-400 italic truncate hover:underline hover:text-red-600 dark:hover:text-red-400 block transition-colors"
                        >
                          {pick.authorName}
                        </Link>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-400 font-mono py-4">No explainers yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 3: OpenBrief Plus ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            <div className="border-x-2 border-neutral-900 dark:border-neutral-100 px-4 py-1">
              <Link href="/journal">
                <img
                  src="/logo-openbrief-plus.png"
                  alt="OpenBrief Plus"
                  className="h-8 sm:h-9 w-auto object-contain dark:hidden"
                />
                <img
                  src="/logo-openbrief-plus-white.png"
                  alt="OpenBrief Plus"
                  className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
                />
              </Link>
            </div>
            <Link href="/journal" className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
              Explore Plus →
            </Link>
          </div>

          {journalArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {journalArticles.slice(0, 3).map((art, i) => (
                <article key={art.id || i} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">
                    Inquiry 0{i + 1}
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h3 className="text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {art.title}
                    </h3>
                  </Link>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="text-[11px] font-mono text-neutral-400 pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                    <span>{art.authorName}</span>
                    <span>{art.readTime}m read</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 font-mono py-6">No essays published yet.</p>
          )}
        </section>

        {/* ── Section 4: TechnoBrief ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            <div className="relative pl-3 pr-5 py-1 border-y border-neutral-900 dark:border-neutral-100">
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-900 dark:bg-neutral-100"></span>
              <Link href="/tech">
                <img
                  src="/logo-technobrief.png"
                  alt="TechnoBrief"
                  className="h-8 sm:h-9 w-auto object-contain dark:hidden"
                />
                <img
                  src="/logo-technobrief-white.png"
                  alt="TechnoBrief"
                  className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
                />
              </Link>
            </div>
            <Link href="/tech" className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
              Tech Wire →
            </Link>
          </div>

          {techArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {techArticles.slice(0, 3).map((art, i) => (
                <article key={art.id || i} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">
                    Tech Byte
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h3 className="text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {art.title}
                    </h3>
                  </Link>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="text-[11px] font-mono text-neutral-400 pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                    <span>{art.authorName}</span>
                    <span>{art.readTime}m</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 font-mono py-6">No technical articles yet.</p>
          )}
        </section>

        {/* ── Section 5: CinēBrief ── */}
        <section className="py-8 sm:py-10">
          <div className="relative border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 flex items-center justify-between overflow-hidden">
            {/* Film Reel Strip Left */}
            <div className="w-6 sm:w-10 self-stretch border-r border-neutral-300 dark:border-neutral-700 bg-neutral-900 dark:bg-black flex flex-col justify-around items-center py-2 shrink-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 sm:w-3.5 sm:h-4 bg-white rounded-xs"></div>
              ))}
            </div>

            <div className="flex-1 px-6 text-center space-y-3">
              <div className="inline-block border-y-2 border-neutral-900 dark:border-neutral-100 px-6 py-2">
                <Link href="/cinebrief">
                  <img
                    src="/logo-cinebrief.png"
                    alt="CinēBrief"
                    className="h-8 sm:h-10 w-auto mx-auto object-contain dark:hidden"
                  />
                  <img
                    src="/logo-cinebrief-white.png"
                    alt="CinēBrief"
                    className="h-8 sm:h-10 w-auto mx-auto object-contain hidden dark:block"
                  />
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-mono">
                Reviews, detailed breakdowns, and culture around movies, shows, and cinema.
              </p>
            </div>

            {/* Film Reel Strip Right */}
            <div className="w-6 sm:w-10 self-stretch border-l border-neutral-300 dark:border-neutral-700 bg-neutral-900 dark:bg-black flex flex-col justify-around items-center py-2 shrink-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 sm:w-3.5 sm:h-4 bg-white rounded-xs"></div>
              ))}
            </div>
          </div>

          {cineArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {cineArticles.slice(0, 3).map((art, i) => (
                <article key={art.id || i} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">
                    Film Essay
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h3 className="text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {art.title}
                    </h3>
                  </Link>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="text-[11px] font-mono text-neutral-400 pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                    <span>{art.authorName}</span>
                    <span>{art.readTime}m</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 font-mono py-6 mt-4">No movie reviews yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}
