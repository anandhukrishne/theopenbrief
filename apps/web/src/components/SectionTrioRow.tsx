'use client'

import Link from 'next/link'
import { Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import CoverImage from '@/components/CoverImage'

export type TrioPattern = 'big-left' | 'big-center' | 'big-right'

interface SectionTrioRowProps {
  articles: Article[]
  pattern: TrioPattern
  className?: string
}

export default function SectionTrioRow({ articles, pattern, className = '' }: SectionTrioRowProps) {
  if (!articles || articles.length === 0) return null

  // Ensure we have up to 3 articles
  const art1 = articles[0]
  const art2 = articles[1] || null
  const art3 = articles[2] || null

  // ── Big Article Card Component (Displays large 16:9 cover image) ──
  const BigCard = ({ article }: { article: Article }) => (
    <article className="group space-y-3">
      <Link href={`/articles/${article.slug}`} className="block space-y-2.5">
        <div className="w-full aspect-[16/9] overflow-hidden rounded-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
          <CoverImage
            src={article.coverImage}
            alt={article.title}
            monogramSize="md"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {article.title}
        </h3>
      </Link>

      {article.excerpt && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 italic leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      )}

      <div className="pt-1 flex items-center gap-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
        <Link
          href={`/authors/${getAuthorSlug(article.authorName)}`}
          className="hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {article.authorName}
        </Link>
        <span>•</span>
        <span>{article.readTime} min read</span>
      </div>
    </article>
  )

  // ── Small Article Card Component (Clean text-only — NO thumbnail displayed per user instruction) ──
  const SmallCard = ({ article }: { article: Article }) => (
    <article className="group flex flex-col justify-between p-4 sm:p-5 rounded-xs bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors h-full">
      <div className="space-y-2">
        <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-red-600 dark:text-red-400 block">
          {article.section}
        </span>
        <Link href={`/articles/${article.slug}`}>
          <h4 className="text-sm sm:text-base font-bold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-3">
            {article.title}
          </h4>
        </Link>
        {article.excerpt && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 italic line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-sans text-neutral-500 dark:text-neutral-400 font-medium">
        <Link
          href={`/authors/${getAuthorSlug(article.authorName)}`}
          className="hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors truncate max-w-[120px]"
        >
          {article.authorName}
        </Link>
        <span>{article.readTime}m read</span>
      </div>
    </article>
  )

  return (
    <div className={`py-6 sm:py-8 border-b border-neutral-200 dark:border-neutral-800/80 ${className}`}>
      {/* Pattern 1: [big] [small] [small] */}
      {pattern === 'big-left' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-6">{BigCard({ article: art1 })}</div>
          {art2 && <div className="md:col-span-3">{SmallCard({ article: art2 })}</div>}
          {art3 && <div className="md:col-span-3">{SmallCard({ article: art3 })}</div>}
        </div>
      )}

      {/* Pattern 2: [small] [big] [small] (Center Big Card) */}
      {pattern === 'big-center' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {art2 ? (
            <>
              <div className="md:col-span-3 order-2 md:order-1">{SmallCard({ article: art1 })}</div>
              <div className="md:col-span-6 order-1 md:order-2">{BigCard({ article: art2 })}</div>
              {art3 && <div className="md:col-span-3 order-3">{SmallCard({ article: art3 })}</div>}
            </>
          ) : (
            <div className="md:col-span-6 md:col-start-4">{BigCard({ article: art1 })}</div>
          )}
        </div>
      )}

      {/* Pattern 3: [small] [small] [big] */}
      {pattern === 'big-right' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {art3 ? (
            <>
              <div className="md:col-span-3">{SmallCard({ article: art1 })}</div>
              <div className="md:col-span-3">{SmallCard({ article: art2! })}</div>
              <div className="md:col-span-6">{BigCard({ article: art3 })}</div>
            </>
          ) : art2 ? (
            <>
              <div className="md:col-span-4">{SmallCard({ article: art1 })}</div>
              <div className="md:col-span-8">{BigCard({ article: art2 })}</div>
            </>
          ) : (
            <div className="md:col-span-6 md:col-start-7">{BigCard({ article: art1 })}</div>
          )}
        </div>
      )}
    </div>
  )
}
