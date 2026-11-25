import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchEditionBySlug, Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import SiteHeader from '@/components/SiteHeader'
import CoverImage from '@/components/CoverImage'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const data = await fetchEditionBySlug(slug)
  if (!data?.edition) {
    return { title: 'Edition Not Found | The Open Brief' }
  }
  const { edition } = data
  return {
    title: `${edition.title} | The Open Brief Special Edition`,
    description: edition.subtitle || edition.description || `Special commemorative edition: ${edition.title}.`,
  }
}

interface ThemeConfig {
  bgGradient: string
  mastheadBorder: string
  badgeBg: string
  badgeText: string
  accentColor: string
  heroBorder: string
  ornamentSymbol: string
  cardBg: string
  heraldSubtitle: string
}

function getThemeConfig(preset: string, customAccent?: string): ThemeConfig {
  switch (preset) {
    case 'christmas':
      return {
        bgGradient: 'from-red-950/20 via-emerald-950/10 to-transparent',
        mastheadBorder: 'border-red-700 dark:border-red-600',
        badgeBg: 'bg-red-700 text-white dark:bg-red-600',
        badgeText: 'text-red-700 dark:text-red-400',
        accentColor: customAccent || '#B91C1C',
        heroBorder: 'border-red-200 dark:border-red-900/60',
        ornamentSymbol: '❄ ✦ ❄',
        cardBg: 'bg-gradient-to-b from-red-50/50 to-white dark:from-red-950/20 dark:to-[#0D131F]',
        heraldSubtitle: 'Festive Commemorative Issue',
      }
    case 'republic':
      return {
        bgGradient: 'from-blue-950/25 via-amber-950/10 to-emerald-950/15',
        mastheadBorder: 'border-blue-800 dark:border-blue-700',
        badgeBg: 'bg-blue-800 text-white dark:bg-blue-700',
        badgeText: 'text-blue-800 dark:text-blue-400',
        accentColor: customAccent || '#1D4ED8',
        heroBorder: 'border-blue-200 dark:border-blue-900/60',
        ornamentSymbol: '§ ✦ §',
        cardBg: 'bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/20 dark:to-[#0D131F]',
        heraldSubtitle: 'National Commemoration & Constitutional Dispatches',
      }
    case 'heritage':
      return {
        bgGradient: 'from-amber-950/25 via-stone-900/10 to-transparent',
        mastheadBorder: 'border-amber-700 dark:border-amber-600',
        badgeBg: 'bg-amber-800 text-amber-50 dark:bg-amber-700',
        badgeText: 'text-amber-800 dark:text-amber-400',
        accentColor: customAccent || '#92400E',
        heroBorder: 'border-amber-200 dark:border-amber-900/60',
        ornamentSymbol: '✦ ❖ ✦',
        cardBg: 'bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-[#0D131F]',
        heraldSubtitle: 'Classical Retrospective & Archival Essays',
      }
    case 'monsoon':
      return {
        bgGradient: 'from-teal-950/25 via-slate-900/20 to-transparent',
        mastheadBorder: 'border-teal-700 dark:border-teal-600',
        badgeBg: 'bg-teal-800 text-teal-50 dark:bg-teal-700',
        badgeText: 'text-teal-800 dark:text-teal-400',
        accentColor: customAccent || '#0F766E',
        heroBorder: 'border-teal-200 dark:border-teal-900/60',
        ornamentSymbol: '≋ ✦ ≋',
        cardBg: 'bg-gradient-to-b from-teal-50/40 to-white dark:from-teal-950/20 dark:to-[#0D131F]',
        heraldSubtitle: 'Literary Season & Contemplative Dispatches',
      }
    case 'midnight':
      return {
        bgGradient: 'from-cyan-950/30 via-purple-950/20 to-transparent',
        mastheadBorder: 'border-cyan-600 dark:border-cyan-500',
        badgeBg: 'bg-cyan-600 text-black font-extrabold',
        badgeText: 'text-cyan-500 dark:text-cyan-400',
        accentColor: customAccent || '#06B6D4',
        heroBorder: 'border-cyan-200 dark:border-cyan-900/60',
        ornamentSymbol: '⚡ ✦ ⚡',
        cardBg: 'bg-gradient-to-b from-cyan-950/15 to-white dark:from-cyan-950/30 dark:to-[#0D131F]',
        heraldSubtitle: 'Frontier Dispatches & Technological Special',
      }
    case 'classic':
    default:
      return {
        bgGradient: 'from-neutral-900/10 to-transparent',
        mastheadBorder: 'border-neutral-900 dark:border-neutral-100',
        badgeBg: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
        badgeText: 'text-red-600 dark:text-red-400',
        accentColor: customAccent || '#DC2626',
        heroBorder: 'border-neutral-200 dark:border-neutral-800',
        ornamentSymbol: '✦ ✦ ✦',
        cardBg: 'bg-white dark:bg-[#0D131F]',
        heraldSubtitle: 'Curated Commemorative Issue',
      }
  }
}

export default async function EditionDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await fetchEditionBySlug(slug)

  if (!data?.edition) {
    notFound()
  }

  const { edition, articles } = data
  const theme = getThemeConfig(edition.themePreset, edition.accentColor)

  const leadArticle = articles.length > 0 ? articles[0] : null
  const secondaryArticles = articles.length > 1 ? articles.slice(1, 4) : []
  const remainingArticles = articles.length > 4 ? articles.slice(4) : []

  const formattedDate = new Date(edition.publishedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <main className={`min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors`}>
      <SiteHeader section="editions" />

      {/* Thematic Top Background Glow */}
      <div className={`w-full bg-gradient-to-b ${theme.bgGradient} pt-6 pb-12 sm:pb-16 px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800`}>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Navigation Breadcrumb & Back Link */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <Link
              href="/editions"
              className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase tracking-wider font-semibold"
            >
              ← All Special Editions
            </Link>
            <span className="uppercase tracking-widest text-[10px]">
              Issue Date: {formattedDate}
            </span>
          </div>

          {/* Commemorative Herald Header */}
          <div className={`pt-2 pb-6 border-b-2 ${theme.mastheadBorder} space-y-4`}>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-extrabold rounded-xs ${theme.badgeBg}`}>
                {edition.badgeText || 'SPECIAL EDITION'}
              </span>
              <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
                {theme.heraldSubtitle}
              </span>
              <span className="text-xs font-serif text-neutral-400 ml-auto hidden sm:inline">
                {theme.ornamentSymbol}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8 space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] font-serif">
                  {edition.title}
                </h1>
                {edition.subtitle && (
                  <p className="text-base sm:text-xl text-neutral-700 dark:text-neutral-300 font-serif italic max-w-3xl leading-relaxed">
                    {edition.subtitle}
                  </p>
                )}
              </div>
              <div className="lg:col-span-4 text-xs font-mono text-neutral-600 dark:text-neutral-400 lg:text-right space-y-1">
                <div>Curated Collection • {articles.length} {articles.length === 1 ? 'Dispatch' : 'Dispatches'}</div>
                {edition.description && (
                  <p className="text-[11px] leading-relaxed line-clamp-3">
                    {edition.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Edition Cover Banner Graphic */}
          {edition.coverImage && (
            <div className={`relative w-full aspect-[21/9] sm:aspect-[24/8] overflow-hidden rounded-xs border ${theme.heroBorder} bg-neutral-100 dark:bg-neutral-900`}>
              <img
                src={edition.coverImage}
                alt={edition.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-8">
                <span className="text-xs sm:text-sm font-mono text-white/90 drop-shadow-sm font-semibold tracking-wider uppercase">
                  {edition.title} • {theme.heraldSubtitle}
                </span>
              </div>
            </div>
          )}

          {/* Optional Letter from the Editor / Prologue */}
          {edition.editorNote && (
            <div className={`border-l-4 ${theme.mastheadBorder} bg-white/70 dark:bg-[#0D131F]/80 p-5 sm:p-7 rounded-r-xs backdrop-blur-xs space-y-2.5`}>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${theme.badgeText} block`}>
                From the Editor&apos;s Desk • Prologue to the Issue
              </span>
              <p className="text-sm sm:text-base font-serif text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                {edition.editorNote}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Main Content Area: Curated Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">

        {articles.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 dark:border-neutral-800 p-8 max-w-xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block font-bold">
              Issue In Assembly
            </span>
            <h2 className="text-2xl font-bold">No Dispatches Attached to This Issue Yet</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Curate or assign published articles to this special edition in the Editorial Studio to showcase them here.
            </p>
            <Link
              href="/editions"
              className="inline-block pt-2 text-xs font-sans font-bold uppercase tracking-wider underline hover:text-red-600"
            >
              ← Back to Special Editions Archive
            </Link>
          </div>
        ) : (
          <>
            {/* Lead Flagship Story */}
            {leadArticle && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className={`text-[11px] font-mono uppercase tracking-widest font-extrabold ${theme.badgeText}`}>
                    Lead Dispatch of the Issue
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {leadArticle.section.toUpperCase()}
                  </span>
                </div>

                <div className={`border ${theme.heroBorder} ${theme.cardBg} p-5 sm:p-8 rounded-xs shadow-xs`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                        {new Date(leadArticle.publishedDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <Link href={`/articles/${leadArticle.slug}`} prefetch={false} className="group block space-y-2.5">
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {leadArticle.title}
                        </h2>
                        {leadArticle.excerpt && (
                          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed line-clamp-3">
                            {leadArticle.excerpt}
                          </p>
                        )}
                      </Link>

                      <div className="pt-2 text-xs font-sans text-neutral-500 flex items-center gap-2">
                        <Link href={`/authors/${getAuthorSlug(leadArticle.authorName)}`} prefetch={false} className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
                          {leadArticle.authorName}
                        </Link>
                        <span>•</span>
                        <span>{leadArticle.readTime} min read</span>
                        <Link
                          href={`/articles/${leadArticle.slug}`}
                          prefetch={false}
                          className="ml-auto font-mono text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white hover:underline"
                        >
                          Read Story →
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <Link
                        href={`/articles/${leadArticle.slug}`}
                        prefetch={false}
                        className="block relative w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden rounded-xs border border-neutral-200 dark:border-neutral-800 group"
                      >
                        <CoverImage
                          src={leadArticle.coverImage}
                          alt={leadArticle.title}
                          monogramSize="lg"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Secondary Featured Row (Articles 2-4) */}
            {secondaryArticles.length > 0 && (
              <section className="space-y-4">
                <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-neutral-700 dark:text-neutral-300">
                    Companion Essays &amp; Inquiries
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {secondaryArticles.map((art) => (
                    <article
                      key={art.id}
                      className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0D131F] p-4 sm:p-5 rounded-xs flex flex-col justify-between space-y-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                    >
                      <div className="space-y-2.5">
                        <Link
                          href={`/articles/${art.slug}`}
                          prefetch={false}
                          className="block relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 overflow-hidden rounded-xs border border-neutral-200 dark:border-neutral-800 group"
                        >
                          <CoverImage
                            src={art.coverImage}
                            alt={art.title}
                            monogramSize="md"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </Link>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold block">
                          {art.section}
                        </span>
                        <Link href={`/articles/${art.slug}`} prefetch={false} className="block group">
                          <h3 className="text-lg font-bold font-serif leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                            {art.title}
                          </h3>
                        </Link>
                        {art.excerpt && (
                          <p className="text-xs font-serif text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="text-[11px] font-sans text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                        <Link href={`/authors/${getAuthorSlug(art.authorName)}`} prefetch={false} className="hover:underline truncate max-w-[150px]">
                          {art.authorName}
                        </Link>
                        <span>{art.readTime} min read</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Additional Issue Stories (Articles 5+) */}
            {remainingArticles.length > 0 && (
              <section className="space-y-4">
                <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-neutral-700 dark:text-neutral-300">
                    Additional Issue Dispatches
                  </span>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-b border-neutral-200 dark:border-neutral-800">
                  {remainingArticles.map((art) => (
                    <div key={art.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
                            {art.section}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">
                            • {art.readTime} min read
                          </span>
                        </div>
                        <Link href={`/articles/${art.slug}`} prefetch={false}>
                          <h4 className="text-base sm:text-lg font-bold font-serif group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                        {art.excerpt && (
                          <p className="text-xs text-neutral-500 font-serif line-clamp-1">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-neutral-500">
                          {art.authorName}
                        </span>
                        <Link
                          href={`/articles/${art.slug}`}
                          prefetch={false}
                          className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 rounded-xs hover:border-black dark:hover:border-white transition-colors"
                        >
                          Read →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Issue Colophon / Footer Sign-off */}
        <div className="pt-8 border-t-2 border-neutral-900 dark:border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">{edition.title}</span>
            <span>•</span>
            <span>The Open Brief Publishing Desk</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/editions" className="hover:underline font-bold text-neutral-900 dark:text-neutral-100">
              Browse All Editions
            </Link>
            <Link href="/" className="hover:underline">
              Return to Front Page
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
