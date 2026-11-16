import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'TechnoBrief',
  description: 'Dense, fast-paced technical bites examining distributed protocols, kernel abstractions, and modern engineering patterns.',
}

export default async function TechPage() {
  const articles = await fetchArticles('tech')

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Section Exclusive Header: Top Header Logo is the SECTION LOGO ── */}
      <header className="border-b border-neutral-300 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/tech" className="flex items-center">
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
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Overview</Link>
              <Link href="/journal" className="hover:text-black dark:hover:text-white transition-colors">Plus</Link>
              <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">Explainers</Link>
              <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">CinēBrief</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
        {/* Subtle Watermark */}
        <div className="absolute right-6 top-8 w-80 h-80 pointer-events-none opacity-[0.05] dark:opacity-[0.04] select-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 fill-current">
            <polygon points="50,0 55,45 100,50 55,55 50,100 45,55 0,50 45,45" />
          </svg>
        </div>

        {/* Section Masthead */}
        <div className="relative z-10 mb-12 pb-6 border-b border-neutral-300 dark:border-neutral-800">
          <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-3 font-bold">
            Pillar 03 • Engineering Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            TechnoBrief
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
            Dense, fast-paced technical bites examining distributed protocols, kernel abstractions, and modern engineering patterns.
          </p>
        </div>

        {/* Articles Grid or Clean Empty State */}
        {articles.length === 0 ? (
          <div className="relative z-10 py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-8 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              Dispatch Wire
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No technical dispatches have been filed under TechnoBrief yet. Return to the overview or check back soon.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 underline hover:text-red-600 dark:hover:text-red-400"
              >
                ← Back to Overview
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article key={art.id} className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 rounded-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">
                    ⚡ Byte
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h2 className="text-lg font-bold leading-snug mt-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {art.title}
                    </h2>
                  </Link>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>{art.authorName}</span>
                  <span>{art.readTime}m read</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
