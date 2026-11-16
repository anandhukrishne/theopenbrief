import Link from 'next/link'
import { fetchArticles, Article } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allArticles = await fetchArticles()

  // Partition into lead cover story and sections
  const leadArticle = allArticles[0]
  const sideArticles = allArticles.slice(1, 4)

  const journalArticles = allArticles.filter((a) => a.section === 'journal').slice(0, 3)
  const explainerArticles = allArticles.filter((a) => a.section === 'explainers').slice(0, 2)
  const techArticles = allArticles.filter((a) => a.section === 'tech').slice(0, 3)

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <main className="min-h-screen">
      {/* ── Top Editorial Date & Edition Bar ── */}
      <div className="border-b border-neutral-200 bg-white text-neutral-500 text-xs font-mono py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div>{todayFormatted}</div>
          <div className="hidden md:block uppercase tracking-widest text-[11px] font-semibold text-neutral-400">
            Independent Dispatches & Intellectual Inquiries
          </div>
          <div className="flex items-center gap-3">
            <span>Adoor / Global</span>
            <span>•</span>
            <span className="text-neutral-900 font-medium">Vol. IV</span>
          </div>
        </div>
      </div>

      {/* ── Primary Publication Masthead ── */}
      <header className="py-6 px-4 sm:px-6 text-center border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-10 sm:h-14 w-auto mx-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>
        </div>

        {/* ── Navigation Strip ── */}
        <nav className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium tracking-wide uppercase text-neutral-600 overflow-x-auto px-4">
          <Link
            href="/journal"
            className="hover:text-black pb-1 border-b-2 border-transparent hover:border-black transition-all whitespace-nowrap"
          >
            OpenBrief Plus
          </Link>
          <Link
            href="/explainers"
            className="hover:text-black pb-1 border-b-2 border-transparent hover:border-black transition-all whitespace-nowrap"
          >
            TOB Explainers
          </Link>
          <Link
            href="/tech"
            className="hover:text-black pb-1 border-b-2 border-transparent hover:border-black transition-all whitespace-nowrap"
          >
            TechnoBrief
          </Link>
          <Link
            href="/about"
            className="hover:text-black pb-1 border-b-2 border-transparent hover:border-black transition-all whitespace-nowrap text-neutral-400"
          >
            About
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* ── Lead Story & Editorial Desk (Asymmetric 12-Column Grid) ── */}
        {leadArticle && (
          <section className="pb-14 border-b border-neutral-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Main Cover Story (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-neutral-900 inline-block"></span>
                  <span>Lead Dispatch</span>
                  <span>•</span>
                  <span>{leadArticle.section.toUpperCase()}</span>
                </div>

                <Link href={`/articles/${leadArticle.slug}`} className="group block space-y-3">
                  <h1 className="editorial-serif text-3xl sm:text-5xl font-bold leading-[1.12] text-neutral-900 group-hover:text-neutral-700 tracking-tight">
                    {leadArticle.title}
                  </h1>

                  {leadArticle.excerpt && (
                    <p className="editorial-serif text-lg sm:text-xl text-neutral-600 leading-relaxed italic">
                      {leadArticle.excerpt}
                    </p>
                  )}
                </Link>

                {leadArticle.coverImage && (
                  <Link href={`/articles/${leadArticle.slug}`} className="block overflow-hidden border border-neutral-200 my-4 group">
                    <img
                      src={leadArticle.coverImage}
                      alt={leadArticle.title}
                      className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </Link>
                )}

                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 pt-2">
                  <span className="text-neutral-800 font-semibold">{leadArticle.authorName}</span>
                  <span>•</span>
                  <span>{new Date(leadArticle.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{leadArticle.readTime} min read</span>
                </div>
              </div>

              {/* Side Dispatch Desk (5 cols) */}
              <div className="lg:col-span-5 lg:border-l lg:border-neutral-200 lg:pl-10 space-y-8">
                <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-900">
                  <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-neutral-900">
                    The Dispatch Desk
                  </h2>
                  <span className="text-xs font-mono text-neutral-400">Curated Takes</span>
                </div>

                <div className="divide-y divide-neutral-200">
                  {sideArticles.map((art, idx) => (
                    <article key={art.id} className="py-6 first:pt-0 last:pb-0 group">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-mono text-xs text-neutral-400 font-semibold">0{idx + 1}.</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                          {art.section}
                        </span>
                      </div>
                      <Link href={`/articles/${art.slug}`} className="block">
                        <h3 className="editorial-serif text-xl sm:text-2xl font-bold leading-snug text-neutral-900 group-hover:text-neutral-600 transition-colors">
                          {art.title}
                        </h3>
                        {art.excerpt && (
                          <p className="text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-400">
                          <span>{art.authorName}</span>
                          <span>•</span>
                          <span>{art.readTime} min</span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Pillar 1: OpenBrief Plus ── */}
        <section className="py-14 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
            <div>
              <Link href="/journal" className="inline-block group">
                <img
                  src="/logo-openbrief-plus.png"
                  alt="OpenBrief Plus"
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-85"
                />
              </Link>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-serif italic">
                In-depth essays, cultural inquiry, and long-form investigative thoughts.
              </p>
            </div>
            <Link
              href="/journal"
              className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold hover:underline"
            >
              View All Plus Essays →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journalArticles.map((art) => (
              <article key={art.id} className="group border-b md:border-b-0 md:border-r border-neutral-200 pb-6 md:pb-0 md:pr-6 last:border-0">
                {art.coverImage && (
                  <Link href={`/articles/${art.slug}`} className="block mb-4 overflow-hidden border border-neutral-200">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <Link href={`/articles/${art.slug}`}>
                  <h3 className="editorial-serif text-xl sm:text-2xl font-bold leading-tight text-neutral-900 group-hover:text-neutral-600 mb-2">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-3">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                    <span>{art.authorName}</span>
                    <span>•</span>
                    <span>{art.readTime} min read</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── Pillar 2: TOB Explainers ── */}
        <section className="py-14 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
            <div>
              <Link href="/explainers" className="inline-block group">
                <img
                  src="/logo-tob-explainers.png"
                  alt="TOB Explainers"
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-85"
                />
              </Link>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-serif italic">
                Visual breakdowns, structural diagrams, and clear elucidations of intricate systems.
              </p>
            </div>
            <Link
              href="/explainers"
              className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold hover:underline"
            >
              Browse All Explainers →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {explainerArticles.map((art) => (
              <article key={art.id} className="p-6 bg-white border border-neutral-200 rounded-sm group hover:border-neutral-400 transition-all">
                <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3 font-semibold">
                  Explainer Breakdown
                </div>
                <Link href={`/articles/${art.slug}`}>
                  <h3 className="editorial-serif text-2xl font-bold leading-snug text-neutral-900 group-hover:text-neutral-700 mb-3">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-3 border-t border-neutral-100">
                    <span>{art.authorName}</span>
                    <span>{art.readTime} min read →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── Pillar 3: TechnoBrief ── */}
        <section className="pt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
            <div>
              <Link href="/tech" className="inline-block group">
                <img
                  src="/logo-technobrief.png"
                  alt="TechnoBrief"
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-85"
                />
              </Link>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-serif italic">
                Engineering intelligence, architectural trade-offs, and software protocols.
              </p>
            </div>
            <Link
              href="/tech"
              className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold hover:underline"
            >
              Read TechnoBrief Feed →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techArticles.map((art) => (
              <article key={art.id} className="p-5 border border-neutral-200 bg-white group hover:border-neutral-900 transition-colors">
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                  ⚡ Technical Bite
                </div>
                <Link href={`/articles/${art.slug}`}>
                  <h3 className="font-sans font-bold text-lg leading-snug text-neutral-900 group-hover:text-neutral-600 mb-2">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 mb-3">
                      {art.excerpt}
                    </p>
                  )}
                  <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>{art.authorName}</span>
                    <span>{art.readTime}m</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
