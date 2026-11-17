import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchArticleBySlug, Article } from '@/lib/api'
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

  const sectionLabels: Record<string, { name: string; href: string }> = {
    journal: { name: 'OpenBrief Plus', href: '/journal' },
    explainers: { name: 'TOB Explainers', href: '/explainers' },
    tech: { name: 'TechnoBrief', href: '/tech' },
    cinebrief: { name: 'CinēBrief', href: '/cinebrief' },
    standalone: { name: 'Standalone Dispatch', href: '/' },
  }

  const sectionMeta = sectionLabels[article.section] || { name: 'Dispatch', href: '/' }

  return (
    <main className="min-h-screen bg-white dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Reading Bar ── */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-3.5 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xs font-mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors">← Back to Articles</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={sectionMeta.href} className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white">
              {sectionMeta.name}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Article Canvas ── */}
      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        {/* Section kicker */}
        <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
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
          <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal mb-8 border-l-2 border-neutral-900 dark:border-neutral-100 pl-6">
            {article.excerpt}
          </p>
        )}

        {/* Byline Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-10 border-y border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500">
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
          <figure className="mb-12 aspect-[16/9] w-full overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
            <CoverImage
              src={article.coverImage}
              alt={article.title}
              monogramSize="lg"
              className="w-full h-full object-cover"
            />
          </figure>
        )}

        {/* Content Body */}
        <div className="max-w-none text-neutral-800 dark:text-neutral-200 leading-[1.8] sm:leading-[1.9] text-base sm:text-lg space-y-6">
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

        {/* Colophon & Author Bio */}
        {article.authorBio && (
          <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
              About the Author
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong>{article.authorName}</strong> — {article.authorBio}
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t-2 border-neutral-900 dark:border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500">
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </article>
    </main>
  )
}
