import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'CinēBrief',
  description: 'Reviews, detailed breakdowns, and culture surrounding cinema, streaming, and visual media.',
}

export default async function CineBriefPage() {
  const articles = await fetchArticles('cinebrief')

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Standardized Responsive Site Header ── */}
      <SiteHeader section="cinebrief" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
        {/* Subtle Watermark */}
        <div className="absolute right-6 top-8 w-80 h-80 pointer-events-none opacity-[0.05] dark:opacity-[0.04] select-none z-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 dark:text-white fill-current">
            <rect x="10" y="10" width="80" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
            <rect x="18" y="20" width="12" height="16" rx="2" />
            <rect x="70" y="20" width="12" height="16" rx="2" />
            <rect x="18" y="64" width="12" height="16" rx="2" />
            <rect x="70" y="64" width="12" height="16" rx="2" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        {/* Section Masthead */}
        <div className="relative z-10 mb-12 pb-6 border-b border-neutral-300 dark:border-neutral-800">
          <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-3 font-bold">
            Cinema &amp; Culture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            CinēBrief
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
            Reviews, detailed breakdown, and cultural identity surrounding cinema, censorship, and visual media.
          </p>
        </div>

        {/* Articles Grid or Clean Empty State */}
        {articles.length === 0 ? (
          <div className="relative z-10 py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-8 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              Articles
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No movie reviews have been filed under CinēBrief yet. Return to Home or check back soon.
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
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article key={art.id} className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 rounded-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">
                    Film Critique
                  </span>
                  <Link href={`/articles/${art.slug}`}>
                    <h2 className="text-lg font-bold leading-snug mt-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      "{art.title}"
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
