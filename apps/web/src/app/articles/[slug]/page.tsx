import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchArticleBySlug, fetchArticles, Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import CoverImage from '@/components/CoverImage'
import LocalDate from '@/components/LocalDate'
import NewsletterSignup from '@/components/NewsletterSignup'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  if (!article) return { title: 'Not Found — The Open Brief' }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app').replace(/\/$/, '')
  const rawImage = article.coverImage?.trim()
  const isValidPublicImage =
    rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/'))
  const previewImageUrl = isValidPublicImage
    ? rawImage.startsWith('/')
      ? `${siteUrl}${rawImage}`
      : rawImage
    : `${siteUrl}/logo.png`

  const description =
    article.excerpt?.trim() || `Read "${article.title}" by ${article.authorName} on The Open Brief.`

  return {
    title: `${article.title} — The Open Brief`,
    description,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description,
      url: `${siteUrl}/articles/${article.slug}`,
      siteName: 'The Open Brief',
      type: 'article',
      publishedTime: article.publishedDate,
      authors: [article.authorName],
      images: [
        {
          url: previewImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [previewImageUrl],
    },
  }
}

function renderInlineFormatting(text: string): (string | React.ReactNode)[] {
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const m = part.match(/^\[(.*?)\]\((.*?)\)$/)
      if (m) {
        return (
          <a
            key={i}
            href={m[2]}
            target={m[2].startsWith('http') ? '_blank' : undefined}
            rel={m[2].startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            {m[1]}
          </a>
        )
      }
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-neutral-950 dark:text-neutral-50">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-mono text-neutral-800 dark:text-neutral-200">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function renderMarkdownContent(rawContent: string) {
  if (!rawContent || !rawContent.trim()) {
    return (
      <p className="text-base text-neutral-500 dark:text-neutral-400 italic">
        Full dispatch text is being prepared by the editorial desk.
      </p>
    )
  }

  const normalized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rawBlocks = normalized.split(/\n{2,}/)

  return rawBlocks.map((block, blockIndex) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Markdown Images: ![caption](url)
    if (trimmed.startsWith('![') && trimmed.includes('](')) {
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/)
      if (match) {
        const caption = match[1]
        const imgUrl = match[2]
        return (
          <figure key={blockIndex} className="my-8 w-full">
            <div className="overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
              <img src={imgUrl} alt={caption || 'Article image'} className="w-full h-auto object-cover" />
            </div>
            {caption && (
              <figcaption className="mt-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 text-center font-medium">
                {caption}
              </figcaption>
            )}
          </figure>
        )
      }
    }

    // Code snippets in monospace
    if (trimmed.startsWith('```')) {
      const codeText = trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '')
      return (
        <pre key={blockIndex} className="bg-neutral-900 dark:bg-black text-neutral-100 p-4 rounded text-xs font-mono overflow-x-auto my-6 border border-neutral-800">
          <code>{codeText}</code>
        </pre>
      )
    }

    // Subheadings
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={blockIndex} className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-10 mb-4 tracking-tight">
          {trimmed.replace(/^#\s+/, '')}
        </h2>
      )
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={blockIndex} className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-10 mb-4 tracking-tight">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      )
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={blockIndex} className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-8 mb-3 tracking-tight">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      )
    }

    // Quotes in Literary Serif
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.split('\n').map((l) => l.replace(/^>\s?/, '')).join(' ')
      return (
        <blockquote key={blockIndex} className="text-xl sm:text-2xl font-serif italic border-l-2 border-red-600 dark:border-red-400 pl-6 my-8 text-neutral-800 dark:text-neutral-200 font-medium">
          {renderInlineFormatting(quoteText)}
        </blockquote>
      )
    }

    // Unordered list
    const lines = trimmed.split('\n')
    if (lines.length > 0 && lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return (
        <ul key={blockIndex} className="my-6 space-y-2 list-disc list-outside pl-6 text-base sm:text-lg">
          {lines.map((line, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatting(line.replace(/^\s*[-*]\s+/, ''))}
            </li>
          ))}
        </ul>
      )
    }

    // Ordered list
    if (lines.length > 0 && lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      return (
        <ol key={blockIndex} className="my-6 space-y-2 list-decimal list-outside pl-6 text-base sm:text-lg">
          {lines.map((line, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatting(line.replace(/^\s*\d+\.\s+/, ''))}
            </li>
          ))}
        </ol>
      )
    }

    // Standard text paragraph with inline links/formatting
    return (
      <p key={blockIndex} className="leading-[1.8] sm:leading-[1.9] text-base sm:text-lg text-neutral-800 dark:text-neutral-200">
        {renderInlineFormatting(trimmed)}
      </p>
    )
  })
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

  const authorSlug = getAuthorSlug(article.authorName)

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Top Reading Bar: Back Link Left, Logo Center, Section + Theme Right ── */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-3.5 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back link */}
          <Link
            href={sectionMeta.href}
            className="text-xs font-sans font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            ← Back
          </Link>

          {/* Center: Brand Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="TheOpenBrief.app"
              className="h-6 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="TheOpenBrief.app"
              className="h-6 w-auto object-contain hidden dark:block"
            />
          </Link>

          {/* Right: Section label + Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={sectionMeta.href}
              className="hidden sm:block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {sectionMeta.name}
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
            {/* Section Breadcrumbs */}
            <nav className="mb-4 flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-neutral-400 font-medium">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href={sectionMeta.href} className="font-bold text-red-600 dark:text-red-400 hover:underline">
                {sectionMeta.name}
              </Link>
            </nav>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.12] text-neutral-900 dark:text-neutral-50 tracking-tight mb-6">
              {article.title}
            </h1>

            {/* Standfirst / Excerpt in Literary Serif */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-serif italic leading-relaxed mb-6 border-l-2 border-red-600 dark:border-red-400 pl-5">
                {article.excerpt}
              </p>
            )}

            {/* Byline Strip (Author link, published date, read time) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 mb-6 border-y border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link
                  href={`/authors/${authorSlug}`}
                  className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  {article.authorName}
                </Link>
                <span>•</span>
                <LocalDate date={article.publishedDate} format="long" />
                <span>•</span>
                <span>{article.readTime} min read</span>
              </div>
            </div>

            {/* Cover Image & Caption */}
            {article.coverImage && (
              <figure className="mb-8 w-full">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
                  <CoverImage
                    src={article.coverImage}
                    alt={article.title}
                    monogramSize="lg"
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.coverImageCaption && (
                  <figcaption className="mt-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 text-center font-medium">
                    {article.coverImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Content Body with Image Support & Editorial Typography */}
            <div className="text-neutral-800 dark:text-neutral-200 leading-[1.8] sm:leading-[1.9] text-base sm:text-lg space-y-6">
              {renderMarkdownContent(article.content)}
            </div>

            {/* ── About Author (Unboxed editorial layout) ── */}
            <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="font-sans text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4">
                About Author
              </div>
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Avatar Photo or Monogram */}
                <Link href={`/authors/${authorSlug}`} className="shrink-0 group">
                  {article.authorAvatar ? (
                    <img
                      src={article.authorAvatar}
                      alt={article.authorName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-neutral-900 text-white dark:bg-neutral-800 flex items-center justify-center font-bold text-sm sm:text-base tracking-wider rounded-full border border-neutral-300 dark:border-neutral-700 select-none shadow-xs">
                      {authorInitials}
                    </div>
                  )}
                </Link>

                {/* Author Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/authors/${authorSlug}`}
                    className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-block"
                  >
                    {article.authorName}
                  </Link>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5">
                    {article.authorBio || 'Author and regular contributor at The Open Brief.'}
                  </p>
                  <div className="mt-2.5">
                    <Link
                      href={`/authors/${authorSlug}`}
                      className="text-xs font-sans font-semibold text-red-600 dark:text-red-400 hover:underline"
                    >
                      View all articles by {article.authorName} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bottom Newsletter Signup ── */}
            <NewsletterSignup variant="article" />

            {/* ── Mobile "Also Read" Section ── */}
            {alsoReadArticles.length > 0 && (
              <div className="block lg:hidden mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-sans text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-bold mb-4">
                  Also Read
                </h3>
                <div className="space-y-4">
                  {alsoReadArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className="flex gap-3.5 items-start group pb-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0"
                    >
                      <div className="w-16 h-16 shrink-0 bg-neutral-100 dark:bg-neutral-900 rounded-xs overflow-hidden border border-neutral-200 dark:border-neutral-800">
                        <CoverImage src={art.coverImage} alt={art.title} monogramSize="sm" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-sans uppercase text-red-600 dark:text-red-400 font-bold block">
                          {art.section}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[11px] text-neutral-500 font-sans block font-medium">
                          {art.authorName} · {art.readTime}m read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-sans text-xs text-neutral-500 font-medium">
              <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
                ← Return to Home
              </Link>
            </div>
          </article>

          {/* ── Right Column: Desktop "Also Read" Sidebar (lg:col-span-4) ── */}
          {alsoReadArticles.length > 0 && (
            <aside className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-bold text-xs tracking-wider text-neutral-900 dark:text-neutral-100 uppercase font-sans">
                    Also Read
                  </h3>
                  <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider font-semibold">
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
                      <div className="w-16 h-16 shrink-0 bg-neutral-100 dark:bg-neutral-900 rounded-xs overflow-hidden border border-neutral-200 dark:border-neutral-800">
                        <CoverImage src={art.coverImage} alt={art.title} monogramSize="sm" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-sans uppercase text-red-600 dark:text-red-400 font-bold block">
                          {art.section}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[11px] text-neutral-500 font-sans block font-medium">
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
