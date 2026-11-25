'use client'

import Link from 'next/link'
import { Article } from '@/lib/api'
import { getAuthorSlug } from '@/lib/utils'
import CoverImage from '@/components/CoverImage'
import SectionWatermark from '@/components/SectionWatermark'

interface SectionHeroBlockProps {
  section: 'explainers' | 'journal' | 'tech' | 'cinebrief' | 'general' | string
  title: string
  href: string
  layout: 'featured-left' | 'featured-right'
  articles: Article[]
  isSectionPage?: boolean
}

export default function SectionHeroBlock({
  section,
  title,
  href,
  layout,
  articles,
  isSectionPage = false,
}: SectionHeroBlockProps) {
  if (!articles || articles.length === 0) return null

  const leadArticle = articles[0]
  const companionArticles = articles.slice(1, 3)

  const FeaturedArticleCard = (
    <article className="space-y-4">
      <Link href={`/articles/${leadArticle.slug}`} prefetch={false} className="group block space-y-3">
        <div className="w-full aspect-[16/9] overflow-hidden rounded-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
          <CoverImage
            src={leadArticle.coverImage}
            alt={leadArticle.title}
            monogramSize="lg"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {leadArticle.title}
        </h2>
      </Link>

      {leadArticle.excerpt && (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 italic leading-relaxed line-clamp-3 font-normal">
          {leadArticle.excerpt}
        </p>
      )}

      <div className="pt-1 flex items-center gap-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
        <Link
          href={`/authors/${getAuthorSlug(leadArticle.authorName)}`}
          prefetch={false}
          className="hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
        >
          {leadArticle.authorName}
        </Link>
        <span>•</span>
        <span>{leadArticle.readTime} min read</span>
      </div>
    </article>
  )

  const SectionHeaderAndStack = (
    <div className="space-y-6">
      <div className="relative pb-3 border-b border-neutral-300 dark:border-neutral-800 flex items-end justify-between overflow-visible min-h-[60px]">
        <div className="relative z-10 flex items-center gap-3">
          <Link href={href} className="group inline-flex items-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        <Link
          href={href}
          className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {isSectionPage ? 'All Articles' : 'Explore →'}
        </Link>

        <div
          className={`absolute pointer-events-none ${
            section === 'explainers'
              ? 'right-6 -top-4 w-36 h-36 sm:w-44 sm:h-44'
              : section === 'journal'
              ? 'left-10 -top-8 w-44 h-44 sm:w-52 sm:h-52'
              : 'right-4 -top-6 w-36 h-36'
          }`}
        >
          <SectionWatermark section={section} className="w-full h-full" />
        </div>
      </div>

      <div className="space-y-4">
        {companionArticles.length > 0 ? (
          companionArticles.map((art) => (
            <article
              key={art.id}
              className="group flex items-start gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
            >
              <Link
                href={`/articles/${art.slug}`}
                prefetch={false}
                className="w-24 sm:w-28 aspect-[4/3] shrink-0 overflow-hidden rounded-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 block"
              >
                <CoverImage
                  src={art.coverImage}
                  alt={art.title}
                  monogramSize="sm"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </Link>

              <div className="flex-1 min-w-0 space-y-1.5">
                <Link href={`/articles/${art.slug}`} prefetch={false}>
                  <h4 className="text-sm sm:text-base font-bold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                    {art.title}
                  </h4>
                </Link>

                <div className="flex items-center gap-2 text-[11px] font-sans text-neutral-500 dark:text-neutral-400 font-medium">
                  <Link
                    href={`/authors/${getAuthorSlug(art.authorName)}`}
                    prefetch={false}
                    className="hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {art.authorName}
                  </Link>
                  <span>•</span>
                  <span>{art.readTime} min read</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="text-xs text-neutral-400 font-sans py-4">No additional stories in this section.</p>
        )}
      </div>
    </div>
  )

  return (
    <section className="relative py-8 sm:py-12 border-b border-neutral-300 dark:border-neutral-800">
      <div className="hidden lg:grid lg:grid-cols-12 gap-10 items-start">
        {layout === 'featured-left' ? (
          <>
            <div className="lg:col-span-7">{FeaturedArticleCard}</div>
            <div className="lg:col-span-5">{SectionHeaderAndStack}</div>
          </>
        ) : (
          <>
            <div className="lg:col-span-5">{SectionHeaderAndStack}</div>
            <div className="lg:col-span-7">{FeaturedArticleCard}</div>
          </>
        )}
      </div>

      <div className="lg:hidden space-y-6">
        <div className="relative pb-3 border-b border-neutral-300 dark:border-neutral-800 flex items-end justify-between overflow-visible min-h-[60px]">
          {section === 'explainers' ? (
            <>
              <Link
                href={href}
                className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {isSectionPage ? 'All Articles' : 'Explore →'}
              </Link>
              <div className="relative z-10 flex items-center gap-3">
                <Link href={href} className="group inline-flex items-center">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 transition-colors text-right">
                    {title}
                  </h3>
                </Link>
              </div>
              <div className="absolute pointer-events-none right-0 -top-4 w-36 h-36">
                <SectionWatermark section={section} className="w-full h-full" />
              </div>
            </>
          ) : (
            <>
              <div className="relative z-10 flex items-center gap-3">
                <Link href={href} className="group inline-flex items-center">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 transition-colors">
                    {title}
                  </h3>
                </Link>
              </div>
              <Link
                href={href}
                className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {isSectionPage ? 'All Articles' : 'Explore →'}
              </Link>
              <div
                className={`absolute pointer-events-none ${
                  section === 'journal'
                    ? 'left-4 -top-6 w-36 h-36'
                    : 'right-2 -top-6 w-32 h-32'
                }`}
              >
                <SectionWatermark section={section} className="w-full h-full" />
              </div>
            </>
          )}
        </div>

        {FeaturedArticleCard}

        <div className="space-y-4">
          {companionArticles.length > 0 ? (
            companionArticles.map((art) => (
              <article
                key={art.id}
                className="group flex items-start gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
              >
                <Link
                  href={`/articles/${art.slug}`}
                  prefetch={false}
                  className="w-24 sm:w-28 aspect-[4/3] shrink-0 overflow-hidden rounded-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 block"
                >
                  <CoverImage
                    src={art.coverImage}
                    alt={art.title}
                    monogramSize="sm"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Link href={`/articles/${art.slug}`} prefetch={false}>
                    <h4 className="text-sm sm:text-base font-bold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] font-sans text-neutral-500 dark:text-neutral-400 font-medium">
                    <Link
                      href={`/authors/${getAuthorSlug(art.authorName)}`}
                      prefetch={false}
                      className="hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {art.authorName}
                    </Link>
                    <span>•</span>
                    <span>{art.readTime} min read</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-xs text-neutral-400 font-sans py-4">No additional stories in this section.</p>
          )}
        </div>
      </div>
    </section>
  )
}