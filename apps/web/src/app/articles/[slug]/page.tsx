import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchArticleBySlug, fetchArticles, Article } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  if (!article) return { title: 'Not Found — The Open Brief' }

  return {
    title: `${article.title} — The Open Brief`,
    description: article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.publishedDate,
      authors: [article.authorName],
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  if (!article) notFound()

  // Fetch candidate articles for "Also Read"
  const allArticles = await fetchArticles()
  const alsoReadArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      // Prioritize articles from the same section
      if (a.section === article.section && b.section !== article.section) return -1
      if (b.section === article.section && a.section !== article.section) return 1
      return 0
    })
    .slice(0, 3)

  const sectionLabels: Record<string, { name: string; href: string }> = {
    journal: { name: 'OpenBrief Plus', href: '/journal' },
    explainers: { name: 'TOB Explainers', href: '/explainers' },
    tech: { name: 'TechnoBrief', href: '/tech' },
    cinebrief: { name: 'CinēBrief', href: '/cinebrief' },
    standalone: { name: 'General', href: '/general' },
    general: { name: 'General', href: '/general' },
  }

  const sectionMeta = sectionLabels[article.section] || { name: 'Articles', href: '/' }

  // Extract author initials for the avatar box
  const authorInitials = article.authorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TOB'

  return (
    <main className="min-h-screen bg-white dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Top Reading Bar: Brand on Left, Back to Articles on Right ── */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-3.5 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo on Left */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="TheOpenBrief.app"
              className="h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="TheOpenBrief.app"
              className="h-7 w-auto object-contain hidden dark:block"
            />
          </Link>

          {/* Right Controls: Back to Articles & Theme Toggle */}
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              ← Back to Articles
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Canvas with Desktop Sidebar / Mobile Stack ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ── Left / Center Column: Article Body (col-span-8) ── */}
          <article className="lg:col-span-8 max-w-3xl">
            {/* Section Kicker */}
            <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Link href={sectionMeta.href} className="font-bold text-red-600 dark:text-red-400 hover:underline">
                {sectionMeta.name}
              </Link>
              <span>•</span>
              <span>{article.readTime} min read</span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.12] text-neutral-900 dark:text-neutral-50 tracking-tight mb-6">
              {article.title}
            </h1>

            {/* Standfirst / Excerpt */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal mb-6 border-l-2 border-neutral-900 dark:border-neutral-100 pl-5">
                {article.excerpt}
              </p>
            )}

            {/* Byline Strip (Tightly spaced, eliminating dead space) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 mb-6 border-y border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{article.authorName}</span>
                <span>•</span>
                <span>
                  {new Date(article.publishedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="text-neutral-400">
                Global
              </div>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <figure className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
                <CoverImage
                  src={article.coverImage}
                  alt={article.title}
                  monogramSize="lg"
                  className="w-full h-full object-cover"
                />
              </figure>
            )}

            {/* Content Body */}
            <div className="text-neutral-800 dark:text-neutral-200 leading-[1.8] sm:leading-[1.9] text-base sm:text-lg space-y-6">
              {article.content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim()
                if (!trimmed) return null

                // Subheadings
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-10 mb-4 tracking-tight">
                      {trimmed.replace('## ', '')}
                    </h2>
                  )
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-8 mb-3 tracking-tight">
                      {trimmed.replace('### ', '')}
                    </h3>
                  )
                }

                // Quotes
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote key={index} className="text-xl border-l-2 border-neutral-900 dark:border-neutral-100 pl-6 my-8 text-neutral-700 dark:text-neutral-300 font-medium">
                      {trimmed.replace('> ', '')}
                    </blockquote>
                  )
                }

                // Code
                if (trimmed.startsWith('```')) {
                  return (
                    <pre key={index} className="bg-neutral-900 dark:bg-black text-neutral-100 p-4 rounded text-xs font-mono overflow-x-auto my-6 border border-neutral-800">
                      {trimmed.replace(/```/g, '')}
                    </pre>
                  )
                }

                // Regular paragraph
                return (
                  <p key={index} className="text-neutral-800 dark:text-neutral-200">
                    {trimmed}
                  </p>
                )
              })}
            </div>

            {/* ── About Author Card (Image 3: Box with Avatar IMG on Left) ── */}
            <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm">
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold mb-4">
                About Author
              </div>
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Avatar Box [IMG] */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-neutral-900 text-white dark:bg-neutral-800 flex items-center justify-center font-bold text-sm sm:text-base tracking-wider rounded-xs border border-neutral-300 dark:border-neutral-700 select-none shadow-xs">
                  {authorInitials}
                </div>
                {/* Author Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {article.authorName}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5">
                    {article.authorBio || 'Author and regular contributor at The Open Brief.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Mobile "Also Read" Section (Shifted below About Author on small screens) ── */}
            {alsoReadArticles.length > 0 && (
              <div className="block lg:hidden mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-bold mb-4">
                  Also Read
                </h3>
                <div className="space-y-4">
                  {alsoReadArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm flex gap-3.5 items-start group"
                    >
                      <div className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 rounded-xs overflow-hidden border border-neutral-300 dark:border-neutral-700">
                        <CoverImage src={art.coverImage} alt={art.title} monogramSize="sm" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-semibold block">
                          {art.section}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[11px] text-neutral-500 font-mono block">
                          {art.authorName} · {art.readTime}m read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-mono text-xs text-neutral-500">
              <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
                ← Return to Home
              </Link>
              <span>Global</span>
            </div>
          </article>

          {/* ── Right Column: Desktop "Also Read" Sidebar (lg:col-span-4) ── */}
          {alsoReadArticles.length > 0 && (
            <aside className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="p-5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 rounded-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 uppercase font-mono">
                    Also Read
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Selected
                  </span>
                </div>

                <div className="space-y-4">
                  {alsoReadArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className="group flex gap-3.5 items-start pb-3 border-b border-neutral-100 dark:border-neutral-800/80 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 rounded-xs overflow-hidden border border-neutral-300 dark:border-neutral-700">
                        <CoverImage src={art.coverImage} alt={art.title} monogramSize="sm" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold block">
                          {art.section}
                        </span>
                        <h4 className="text-xs font-bold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[11px] text-neutral-500 font-mono block">
                          {art.authorName} · {art.readTime}m read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </main>
  )
}
