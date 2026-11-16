import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { fetchArticles } from '@/lib/api'

export const metadata = {
  title: 'Sitemap',
}

export const dynamic = 'force-dynamic'

export default async function SitemapPage() {
  const allArticles = await fetchArticles()

  const sections = [
    { name: 'OpenBrief Plus', href: '/journal', desc: 'Long-form essays and philosophical inquiries' },
    { name: 'TOB Explainers', href: '/explainers', desc: 'Visual and structural deep dives' },
    { name: 'TechnoBrief', href: '/tech', desc: 'Engineering intelligence and technical analysis' },
    { name: 'CinēBrief', href: '/cinebrief', desc: 'Cinematic investigations and cultural arts' },
  ]

  const sectionArticles: Record<string, typeof allArticles> = {
    journal: allArticles.filter((a) => a.section === 'journal'),
    explainers: allArticles.filter((a) => a.section === 'explainers'),
    tech: allArticles.filter((a) => a.section === 'tech'),
    cinebrief: allArticles.filter((a) => a.section === 'cinebrief'),
    standalone: allArticles.filter((a) => a.section === 'standalone'),
  }

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

      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Navigation
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
          Sitemap
        </h1>

        {/* Core Pages */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Pages
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:underline font-medium">Home</Link>
              <span className="text-neutral-400 ml-2">— Front page and editorial overview</span>
            </li>
            <li>
              <Link href="/about" className="hover:underline font-medium">About</Link>
              <span className="text-neutral-400 ml-2">— Publication colophon and manifesto</span>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline font-medium">Privacy Policy</Link>
              <span className="text-neutral-400 ml-2">— Data handling and privacy</span>
            </li>
            <li>
              <Link href="/terms" className="hover:underline font-medium">Terms of Use</Link>
              <span className="text-neutral-400 ml-2">— Usage terms and conditions</span>
            </li>
          </ul>
        </div>

        {/* Sections */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Editorial Pillars
          </h2>
          <div className="space-y-6">
            {sections.map((sec) => (
              <div key={sec.href}>
                <Link href={sec.href} className="hover:underline font-medium text-base">
                  {sec.name}
                </Link>
                <span className="text-neutral-400 text-sm ml-2">— {sec.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Articles by Section */}
        {allArticles.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              Published Articles ({allArticles.length})
            </h2>
            <div className="space-y-8">
              {Object.entries(sectionArticles)
                .filter(([, arts]) => arts.length > 0)
                .map(([section, arts]) => (
                  <div key={section}>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-500 mb-3 font-bold">
                      {section}
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      {arts.map((art) => (
                        <li key={art.id}>
                          <Link
                            href={`/articles/${art.slug}`}
                            className="hover:underline text-neutral-700 dark:text-neutral-300"
                          >
                            {art.title}
                          </Link>
                          <span className="text-neutral-400 ml-2 text-xs font-mono">
                            {art.authorName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Adoor / Global</span>
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Front Page
          </Link>
        </div>
      </div>
    </main>
  )
}
