import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'General Dispatches — The Open Brief',
  description: 'Independent inquiries, essays, fiction, and standalone dispatches.',
}

export default async function GeneralPage() {
  const articles = await fetchArticles('general')

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Section Exclusive Header ── */}
      <header className="border-b border-neutral-300 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="The Open Brief"
              className="h-7 w-auto object-contain hidden dark:block"
            />
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400 overflow-x-auto">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
              <Link href="/journal" className="hover:text-black dark:hover:text-white transition-colors">Plus</Link>
              <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">Explainers</Link>
              <Link href="/tech" className="hover:text-black dark:hover:text-white transition-colors">Tech</Link>
              <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">CinēBrief</Link>
              <Link href="/general" className="text-black dark:text-white font-extrabold underline transition-colors">General</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
        {/* Subtle Watermark */}
        <div className="absolute right-6 top-8 w-72 h-72 pointer-events-none opacity-[0.05] dark:opacity-[0.04] select-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 dark:text-white fill-current">
            <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
          </svg>
        </div>

        {/* Section Masthead */}
        <div className="relative z-10 mb-12 pb-6 border-b border-neutral-300 dark:border-neutral-800">
          <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-3 font-bold">
            General &amp; Standalone
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            General Dispatches
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
            Independent inquiries, long-form fiction, commentary, and standalone observations published outside the core pillars.
          </p>
        </div>

        {/* Articles Grid or Clean Empty State */}
        {articles.length === 0 ? (
          <div className="relative z-10 py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-8 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              Articles
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No standalone dispatches have been published yet. Return to Home or check back soon.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 underline hover:text-red-600 dark:hover:text-red-400"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article key={art.id} className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 rounded-sm space-y-4 flex flex-col justify-between">
                <div>
                  {art.coverImage && (
                    <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
                      <CoverImage
                        src={art.coverImage}
                        alt={art.title}
                        monogramSize="md"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">
                    Standalone Dispatch
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h2 className="text-xl font-bold leading-snug mt-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {art.title}
                    </h2>
                  </Link>
                  {art.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>{art.authorName}</span>
                  <span>{art.readTime} min read →</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
