import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const articles = await fetchArticles('journal')

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Section Exclusive Header: Top Header Logo is the SECTION LOGO ── */}
      <header className="border-b border-neutral-300 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/journal" className="flex items-center">
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
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Overview</Link>
              <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">Explainers</Link>
              <Link href="/tech" className="hover:text-black dark:hover:text-white transition-colors">Tech</Link>
              <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">CinēBrief</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
        {/* Half-Visible Design Artifact Watermark in the background */}
        <div className="absolute right-4 top-10 w-72 h-72 pointer-events-none opacity-10 dark:opacity-10 select-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 dark:text-white fill-current">
            <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
          </svg>
        </div>

        {/* Section Masthead */}
        <div className="relative z-10 mb-12 pb-6 border-b border-neutral-300 dark:border-neutral-800">
          <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-3 font-bold">
            Pillar 01 • Long-Form Inquiries & Essays
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            OpenBrief Plus
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
            A salon for cultural analysis, philosophical inquiry, and deep essays that reward sustained attention.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <article key={art.id} className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 rounded-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">
                  Inquiry 0{idx + 1}
                </span>
                <Link href={`/articles/${art.slug}`}>
                  <h2 className="text-xl font-bold leading-tight mt-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
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
                <span>{art.readTime} min read →</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
