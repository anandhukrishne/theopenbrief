import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchArticleBySlug, Article } from '@/lib/api'

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
  }

  const sectionMeta = sectionLabels[article.section] || { name: 'Dispatch', href: '/' }

  return (
    <main className="min-h-screen bg-white">
      {/* ── Reading Bar ── */}
      <header className="border-b border-neutral-200 py-3.5 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xs font-mono text-neutral-400 group-hover:text-black transition-colors">← Back to Overview</span>
          </Link>
          <Link href={sectionMeta.href} className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600 hover:text-black">
            {sectionMeta.name}
          </Link>
        </div>
      </header>

      {/* ── Article Canvas ── */}
      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        {/* Section kicker */}
        <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
          <Link href={sectionMeta.href} className="font-semibold text-neutral-900 hover:underline">
            {sectionMeta.name}
          </Link>
          <span>•</span>
          <span>{article.readTime} min read</span>
        </div>

        {/* Primary Headline */}
        <h1 className="editorial-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.12] text-neutral-900 tracking-tight mb-6">
          {article.title}
        </h1>

        {/* Standfirst / Excerpt */}
        {article.excerpt && (
          <p className="editorial-serif text-xl sm:text-2xl text-neutral-600 leading-relaxed italic mb-8 border-l-2 border-neutral-900 pl-6">
            {article.excerpt}
          </p>
        )}

        {/* Byline Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-10 border-y border-neutral-200 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{article.authorName}</span>
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
            Adoor / Global
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <figure className="mb-12">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full rounded-sm border border-neutral-200 aspect-[16/9] object-cover"
            />
            <figcaption className="text-xs font-mono text-neutral-400 mt-2 text-center">
              Published via cdn.theopenbrief.app
            </figcaption>
          </figure>
        )}

        {/* Content Body */}
        <div className="prose prose-neutral max-w-none text-neutral-800 leading-[1.8] sm:leading-[1.9] text-base sm:text-lg">
          {article.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim()
            if (!trimmed) return null

            // Subheadings
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={index} className="editorial-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-10 mb-4 tracking-tight">
                  {trimmed.replace('## ', '')}
                </h2>
              )
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={index} className="editorial-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-8 mb-3 tracking-tight">
                  {trimmed.replace('### ', '')}
                </h3>
              )
            }

            // Quotes
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={index} className="editorial-serif italic text-xl border-l-2 border-neutral-900 pl-6 my-8 text-neutral-700">
                  {trimmed.replace('> ', '')}
                </blockquote>
              )
            }

            // Regular paragraph with drop cap on the first paragraph
            return (
              <p key={index} className={`mb-6 text-neutral-800 ${index === 0 ? 'drop-cap' : ''}`}>
                {trimmed}
              </p>
            )
          })}
        </div>

        {/* Colophon & Navigation */}
        <div className="mt-16 pt-8 border-t-2 border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500">
          <div>
            Dispatched under The Open Brief Editorial Standards.
          </div>
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            ← Return to All Dispatches
          </Link>
        </div>
      </article>
    </main>
  )
}
