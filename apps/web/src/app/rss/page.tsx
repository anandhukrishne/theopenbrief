import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { fetchArticles } from '@/lib/api'

export const metadata = {
  title: 'RSS Feed — Really Simple Syndication',
  description: 'Subscribe to The Open Brief via Really Simple Syndication (RSS).',
}

export const dynamic = 'force-dynamic'

export default async function RssPage() {
  const articles = await fetchArticles()
  const feedUrl = 'https://theopenbrief.app/rss.xml'

  return (
    <main className="min-h-screen bg-white dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain dark:hidden" />
            <img src="/logo-white.png" alt="The Open Brief" className="h-7 w-auto object-contain hidden dark:block" />
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
              <Link href="/journal" className="hover:text-black dark:hover:text-white transition-colors">Plus</Link>
              <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">Explainers</Link>
              <Link href="/tech" className="hover:text-black dark:hover:text-white transition-colors">Tech</Link>
              <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">CinēBrief</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Syndication
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
          Really Simple Syndication (RSS)
        </h1>

        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
          Subscribe to The Open Brief using your favorite RSS reader to receive new explainers, technical breakdowns, movie reviews, and essays as soon as they are published.
        </p>

        {/* Feed URL Box */}
        <div className="p-6 border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 rounded-sm mb-12 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold">
              Feed URL
            </span>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              View XML Feed ↗
            </a>
          </div>
          <div className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 font-mono text-sm text-neutral-800 dark:text-neutral-200 select-all overflow-x-auto">
            {feedUrl}
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Copy this link into any RSS reader like Feedly, NetNewsWire, Inoreader, or Apple News to follow along without algorithms or tracking.
          </p>
        </div>

        {/* How to use */}
        <div className="space-y-6 text-neutral-700 dark:text-neutral-300 text-base leading-relaxed mb-12">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Why RSS?
          </h2>
          <p>
            RSS puts you in complete control of what you read. No feeds optimized for engagement, no infinite scrolling, and no notifications interrupting your day. You get the full list of published articles delivered directly to your reader on your own schedule.
          </p>
        </div>

        {/* Recent Articles in Feed */}
        {articles.length > 0 && (
          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500 font-bold mb-4">
              Recently Syndicated ({articles.length})
            </h2>
            <ul className="space-y-3 text-sm">
              {articles.slice(0, 10).map((art) => (
                <li key={art.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <Link
                    href={`/articles/${art.slug}`}
                    className="hover:underline font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    {art.title}
                  </Link>
                  <span className="text-xs text-neutral-400 font-mono">
                    {art.section} · {art.authorName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Global</span>
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
