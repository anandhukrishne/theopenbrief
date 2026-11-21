import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'
import SectionHeroBlock from '@/components/SectionHeroBlock'
import SectionTrioRow, { TrioPattern } from '@/components/SectionTrioRow'

interface SectionPageViewProps {
  section: 'explainers' | 'journal' | 'tech' | 'cinebrief' | 'general'
  title: string
  href: string
  layout: 'featured-left' | 'featured-right'
  emptyDescription: string
}

const TRIO_PATTERNS: TrioPattern[] = ['big-center', 'big-left', 'big-right']

export default async function SectionPageView({
  section,
  title,
  href,
  layout,
  emptyDescription,
}: SectionPageViewProps) {
  const articles = await fetchArticles(section)

  // Chunk remaining articles (index 3 onwards) into groups of 3
  const remainingArticles = articles.slice(3)
  const chunks = []
  for (let i = 0; i < remainingArticles.length; i += 3) {
    chunks.push(remainingArticles.slice(i, i + 3))
  }

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={section} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {articles.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xs p-8 max-w-xl mx-auto my-12">
            <span className="font-sans text-[10px] uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              {title}
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {emptyDescription}
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-sans font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 underline hover:text-red-600 dark:hover:text-red-400"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <SectionHeroBlock
              section={section}
              title={title}
              href={href}
              layout={layout}
              articles={articles}
              isSectionPage={true}
            />

            {chunks.map((chunk, idx) => (
              <SectionTrioRow
                key={idx}
                articles={chunk}
                pattern={TRIO_PATTERNS[idx % TRIO_PATTERNS.length]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
