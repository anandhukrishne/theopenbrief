import Link from 'next/link'
import { fetchArticles, Article } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allArticles = await fetchArticles()

  // Default curated editorial items if DB is fresh
  const sampleFallback: Article[] = [
    {
      id: 'animal-culture',
      title: 'The movies like Animal are a threat to our society; spreading like cancer among youth',
      slug: 'animal-threat-to-society-cinema-critique',
      section: 'cinebrief',
      excerpt: 'Speaking about recent controversy involving a child from Andhra as victim, Anandragasamy broke his silence on the "protection" the censor board provides to filmmaker like Sandeep Vanga Reddy.',
      content: '',
      authorName: 'AnandRangasamy',
      authorBio: "Cultural & Film Essayist on Indian Cinema and Censorship",
      publishedDate: new Date().toISOString(),
      readTime: 6,
    },
    {
      id: 'neural-protocols',
      title: 'The Mechanical Sympathy of Modern Edge Networks',
      slug: 'mechanical-sympathy-edge-networks',
      section: 'tech',
      excerpt: 'Analyzing deterministic tail latencies and distributed compute primitives across decentralized backbones.',
      content: '',
      authorName: 'The Open Brief Desk',
      publishedDate: new Date().toISOString(),
      readTime: 4,
    },
    {
      id: 'architectural-inquiry',
      title: 'Architectures of Human Restraint in Algorithmic Feeds',
      slug: 'architectures-of-human-restraint',
      section: 'journal',
      excerpt: 'Why sustained contemplation requires deliberate structural friction against hyper-optimized engagement loops.',
      content: '',
      authorName: 'Editorial Board',
      publishedDate: new Date().toISOString(),
      readTime: 8,
    },
    {
      id: 'explainer-monad',
      title: 'Demystifying Zero-Knowledge State Transition Rollups',
      slug: 'demystifying-zk-state-transitions',
      section: 'explainers',
      excerpt: 'A step-by-step visual dissection of polynomial commitments and recursive proof validation.',
      content: '',
      authorName: 'Systems Analyst',
      publishedDate: new Date().toISOString(),
      readTime: 7,
    },
  ]

  // Use real articles or graceful fallback to preserve mockup layout
  const articles = allArticles.length > 0 ? allArticles : sampleFallback

  const heroArticle = articles.find((a) => a.section === 'explainers') || articles[0]
  const topPicks = articles.slice(0, 3)
  const secondaryLead = articles[1] || articles[0]
  const explainerPicks = articles.filter((a) => a.section === 'explainers' || a.section === 'tech').slice(0, 2)

  const journalArticles = articles.filter((a) => a.section === 'journal')
  const techArticles = articles.filter((a) => a.section === 'tech')
  const cineArticles = articles.filter((a) => a.section === 'cinebrief')

  // Date formatted like in the mockup
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Top Masthead Header (Matching Wireframe) ── */}
      <div className="border-b border-neutral-300 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <div className="w-full md:w-1/4 text-center md:text-left font-medium">
            {dateFormatted}
          </div>

          {/* Centered Showcase Box with Vertical Border Rules */}
          <div className="w-full md:w-2/4 flex items-center justify-center border-y md:border-y-0 md:border-x border-neutral-300 dark:border-neutral-800 px-6 py-1">
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
            <span>Global edition | Week 46</span>
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
          <Link href="/about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap text-neutral-400">
            ABOUT
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Section 1 / Hero: Story of the Day & Top Picks (Wireframe Section 1) ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Side: Story of the day */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider font-mono">
                Story of the day {heroArticle.section.toUpperCase()}
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

              {/* Cover Box with Center TOB Monogram */}
              <Link
                href={`/articles/${heroArticle.slug}`}
                className="block relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden group"
              >
                {heroArticle.coverImage ? (
                  <img
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center font-bold text-xl sm:text-2xl tracking-tight shadow-md">
                      TOB
                    </div>
                  </div>
                )}
              </Link>
            </div>

            {/* Right Side: Top Picks of the day */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                Top Picks of the day
              </h2>

              <div className="space-y-4">
                {topPicks.map((pick, i) => (
                  <div key={pick.id || i} className="p-3 bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm flex gap-3.5 items-start">
                    {/* Small thumbnail with TOB logo in center */}
                    <Link
                      href={`/articles/${pick.slug}`}
                      className="w-20 h-20 shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden"
                    >
                      {pick.coverImage ? (
                        <img src={pick.coverImage} alt={pick.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                          TOB
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                        {pick.section}
                      </span>
                      <Link href={`/articles/${pick.slug}`}>
                        <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                          "{pick.title}"
                        </h3>
                      </Link>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic truncate">
                        {pick.authorName} on recent developments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Featured Explainer & Watermark Artifact (Wireframe Section 2) ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Side: Large Image + Quoted Headline + Standfirst */}
            <div className="lg:col-span-7 space-y-3">
              <Link
                href={`/articles/${secondaryLead.slug}`}
                className="block relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden group"
              >
                {secondaryLead.coverImage ? (
                  <img
                    src={secondaryLead.coverImage}
                    alt={secondaryLead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center font-bold text-xl sm:text-2xl tracking-tight shadow-md">
                      TOB
                    </div>
                  </div>
                )}
              </Link>

              <Link href={`/articles/${secondaryLead.slug}`} className="block group">
                <h2 className="text-xl sm:text-3xl font-extrabold leading-snug tracking-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                  "{secondaryLead.title}"
                </h2>
                {secondaryLead.excerpt && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                    {secondaryLead.excerpt}
                  </p>
                )}
              </Link>
            </div>

            {/* Right Side: TOB Explainers Logo + Half-Visible Pink Coral Artifact + Picks */}
            <div className="lg:col-span-5 relative space-y-4">
              {/* Top Row with Header and TOB Explainers logo */}
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

              {/* Half-Visible Design Artifact Watermark (Coral Starburst / Polygon as in wireframe) */}
              <div className="absolute right-0 top-6 w-44 h-44 pointer-events-none opacity-20 dark:opacity-15 z-0 select-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500 fill-current">
                  <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
                </svg>
              </div>

              {/* 2 Stacked Cards */}
              <div className="relative z-10 space-y-4">
                {explainerPicks.map((pick, i) => (
                  <div key={pick.id || i} className="p-3 bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm flex gap-3.5 items-start">
                    <Link
                      href={`/articles/${pick.slug}`}
                      className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden"
                    >
                      {pick.coverImage ? (
                        <img src={pick.coverImage} alt={pick.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">
                          TOB
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                        {pick.section}
                      </span>
                      <Link href={`/articles/${pick.slug}`}>
                        <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                          "{pick.title}"
                        </h3>
                      </Link>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic truncate">
                        {pick.authorName} on latest direction
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: OpenBrief Plus (Wireframe Section 3) ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            {/* Boxed framing around logo as in mockup */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(journalArticles.length > 0 ? journalArticles : articles.slice(0, 3)).map((art, i) => (
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
        </section>

        {/* ── Section 4: TechnoBrief with Crosshair Framing (Wireframe Section 4) ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            {/* Crosshair / framing lines as in mockup */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(techArticles.length > 0 ? techArticles : articles.slice(0, 3)).map((art, i) => (
              <article key={art.id || i} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-sm space-y-2">
                <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">
                  ⚡ Tech Byte
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
        </section>

        {/* ── Section 5: CinēBrief with Celluloid Film Reel Strip Borders (Wireframe Section 5) ── */}
        <section className="py-8 sm:py-10 border-b border-neutral-300 dark:border-neutral-800">
          <div className="relative border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 flex items-center justify-between overflow-hidden">
            {/* Film Reel Strip Left */}
            <div className="w-6 sm:w-10 self-stretch border-r border-neutral-300 dark:border-neutral-700 bg-neutral-900 dark:bg-black flex flex-col justify-around items-center py-2 shrink-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 sm:w-3.5 sm:h-4 bg-white rounded-xs"></div>
              ))}
            </div>

            {/* Center Box with CinēBrief Logo */}
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
                Cinematic investigations, film critique, and narrative storytelling.
              </p>
            </div>

            {/* Film Reel Strip Right */}
            <div className="w-6 sm:w-10 self-stretch border-l border-neutral-300 dark:border-neutral-700 bg-neutral-900 dark:bg-black flex flex-col justify-around items-center py-2 shrink-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2.5 h-3.5 sm:w-3.5 sm:h-4 bg-white rounded-xs"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {(cineArticles.length > 0 ? cineArticles : articles.slice(0, 3)).map((art, i) => (
              <article key={art.id || i} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-sm space-y-2">
                <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">
                  🎬 Film Essay
                </span>
                <Link href={`/articles/${art.slug}`}>
                  <h3 className="text-base font-bold leading-snug line-clamp-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    "{art.title}"
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
        </section>

        {/* ── Section 6: Footer Art & Studio Cards (Wireframe Footer Design) ── */}
        <section className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-neutral-300 dark:border-neutral-800">
            {/* Left 4 cols: TheOpenBrief.app + Contact Box */}
            <div className="md:col-span-4 space-y-4">
              <Link href="/">
                <img
                  src="/logo.png"
                  alt="TheOpenBrief.app"
                  className="h-9 w-auto object-contain dark:hidden"
                />
                <img
                  src="/logo-white.png"
                  alt="TheOpenBrief.app"
                  className="h-9 w-auto object-contain hidden dark:block"
                />
              </Link>

              <div className="p-5 border-2 border-neutral-900 dark:border-neutral-200 bg-neutral-50 dark:bg-neutral-900/80 rounded-sm space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-widest font-bold">Contact Newsroom</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Send dispatches, pitch investigative essays, or communicate with our editors:
                </p>
                <div className="pt-1">
                  <a
                    href="mailto:editorial@theopenbrief.app"
                    className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 underline"
                  >
                    editorial@theopenbrief.app
                  </a>
                </div>
              </div>
            </div>

            {/* Center 4 cols: Editorial Links Box */}
            <div className="md:col-span-4 space-y-3">
              <div className="p-5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-sm space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-widest font-bold pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  Publication Pillars
                </h4>
                <ul className="space-y-2 text-xs font-mono">
                  <li><Link href="/journal" className="hover:underline">→ OpenBrief Plus</Link></li>
                  <li><Link href="/explainers" className="hover:underline">→ TOB Explainers</Link></li>
                  <li><Link href="/tech" className="hover:underline">→ TechnoBrief</Link></li>
                  <li><Link href="/cinebrief" className="hover:underline">→ CinēBrief</Link></li>
                  <li><Link href="/about" className="hover:underline">→ About The Open Brief</Link></li>
                </ul>
              </div>
              <p className="text-[11px] font-mono text-neutral-500">
                © TheOpenBrief. All rights reserved.
              </p>
            </div>

            {/* Right 4 cols: Graphic Shapes Accent & "Dev 45 studios" */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center space-y-4">
              <div className="flex items-center gap-4">
                {/* Grey Star */}
                <svg className="w-10 h-10 text-neutral-400 fill-current" viewBox="0 0 24 24">
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
                {/* Coral Starburst */}
                <svg className="w-16 h-16 text-rose-400 fill-current" viewBox="0 0 100 100">
                  <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
                </svg>
                {/* Blue Hexagon */}
                <svg className="w-10 h-10 text-indigo-400 fill-current" viewBox="0 0 100 100">
                  <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" />
                </svg>
              </div>

              <div className="font-mono text-xs font-bold tracking-widest text-neutral-700 dark:text-neutral-300">
                Dev 45 studios
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-black dark:hover:text-white">Privacy ↗</Link>
              <Link href="/about" className="hover:text-black dark:hover:text-white">Terms ↗</Link>
              <Link href="/about" className="hover:text-black dark:hover:text-white">Sitemap ↗</Link>
            </div>
            <div>
              Adoor / Global
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
