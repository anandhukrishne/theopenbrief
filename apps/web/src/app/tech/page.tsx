import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'
import SectionHeroBlock from '@/components/SectionHeroBlock'
import SectionTrioRow, { TrioPattern } from '@/components/SectionTrioRow'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'TechnoBrief',
  description: 'Recent technical advancements, engineering insights, and navigating digital-life balance.',
}

export default async function TechPage() {
  const articles = await fetchArticles('tech')

  const trioPatterns: TrioPattern[] = ['big-right', 'big-center', 'big-left']

  const remainingArticles = articles.slice(3)
  const chunks = []
  for (let i = 0; i < remainingArticles.length; i += 3) {
    chunks.push(remainingArticles.slice(i, i + 3))
  }

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Standardized Responsive Site Header ── */}
      <SiteHeader section="tech" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {articles.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xs p-8 max-w-xl mx-auto my-12">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              TechnoBrief
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No technical articles have been published in TechnoBrief yet. Check back soon.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 underline hover:text-red-600 dark:hover:text-red-400"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Signature Section Hero with Big Lead Article & Simple Digital Art Circuit Watermark */}
            <SectionHeroBlock
              section="tech"
              title="TechnoBrief"
              href="/tech"
              layout="featured-left"
              articles={articles}
              isSectionPage={true}
            />

            {/* Subsequent Articles (Alternating 3-Column Schemes) */}
            {chunks.map((chunk, idx) => (
              <SectionTrioRow
                key={idx}
                articles={chunk}
                pattern={trioPatterns[idx % trioPatterns.length]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
