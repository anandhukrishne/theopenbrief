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

const SECTION_LOGOS: Record<string, { light: string; dark: string; alt: string }> = {
  journal: {
    light: '/logo-openbrief-plus.png',
    dark: '/logo-openbrief-plus-white.png',
    alt: 'OpenBrief Plus',
  },
  explainers: {
    light: '/logo-tob-explainers.png',
    dark: '/logo-tob-explainers-white.png',
    alt: 'TOB Explainers',
  },
  tech: {
    light: '/logo-technobrief.png',
    dark: '/logo-technobrief-white.png',
    alt: 'TechnoBrief',
  },
  cinebrief: {
    light: '/logo-cinebrief.png',
    dark: '/logo-cinebrief-white.png',
    alt: 'CinēBrief',
  },
}

function SectionBrandHeading({ section, title, alignRight = false }: { section: string; title: string; alignRight?: boolean }) {
  const logo = SECTION_LOGOS[section]
  if (logo) {
    return (
      <>
        <img
          src={logo.light}
          alt={logo.alt}
          className="h-7 sm:h-9 w-auto object-contain dark:hidden"
        />
        <img
          src={logo.dark}
          alt={logo.alt}
          className="h-7 sm:h-9 w-auto object-contain hidden dark:block"
        />
      </>
    )
  }

  return (
    <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 transition-colors ${alignRight ? 'text-right' : ''}`}>
      {title}
    </h3>
  )
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
    <article className="space-y-2.5">
      <Link href={`/articles/${leadArticle.slug}`} prefetch={false} className="group block space-y-2">
        <div className="w-full aspect-[16/9] overflow-hidden rounded-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
          <CoverImage
            src={leadArticle.coverImage}
            alt={leadArticle.title}
            monogramSize="lg"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-neutral-900 dark:text-neutral-50 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors pt-0.5">
          {leadArticle.title}
        </h2>
      </Link>

      {leadArticle.excerpt && (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 italic leading-snug line-clamp-3 font-normal">
          {leadArticle.excerpt}
        </p>
      )}

      <div className="pt-1 flex items-center justify-between gap-3 text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
        <Link
          href={`/authors/${getAuthorSlug(leadArticle.authorName)}`}
          prefetch={false}
          className="inline-flex items-center gap-1.5 hover:underline hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{leadArticle.authorName}</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 shrink-0">
          <svg className="w-3.5 h-3.5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{leadArticle.readTime} min read</span>
        </span>
      </div>
    </article>
  )

  const SectionHeaderAndStack = (
    <div className="space-y-6">
      <div className="relative pb-3 border-b border-neutral-300 dark:border-neutral-800 flex items-end justify-between overflow-visible min-h-[60px]">
        <div className="relative z-10 flex items-center gap-3">
          <Link href={href} className="group inline-flex items-center">
            <SectionBrandHeading section={section} title={title} />
          </Link>
        </div>

        {!isSectionPage && (
          <Link
            href={href}
            className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Explore →
          </Link>
        )}

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
              {!isSectionPage ? (
                <Link
                  href={href}
                  className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Explore →
                </Link>
              ) : (
                <div />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <Link href={href} className="group inline-flex items-center">
                  <SectionBrandHeading section={section} title={title} alignRight />
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
                  <SectionBrandHeading section={section} title={title} />
                </Link>
              </div>
              {!isSectionPage && (
                <Link
                  href={href}
                  className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Explore →
                </Link>
              )}
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
