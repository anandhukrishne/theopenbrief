import Link from 'next/link'
import { fetchArticles } from '@/lib/api'
import SiteHeader from '@/components/SiteHeader'
import SectionHeroBlock from '@/components/SectionHeroBlock'
import SectionTrioRow, { TrioPattern } from '@/components/SectionTrioRow'

export const revalidate = 60

export const metadata = {
  title: 'OpenBrief Plus',
  description: 'Philosophical essays, cultural narratives and investigative journals.',
}

export default async function JournalPage() {
  const articles = await fetchArticles('journal')

  // Alternating patterns for subsequent trios
  const trioPatterns: TrioPattern[] = ['big-left', 'big-center', 'big-right']

  // Chunk remaining articles (articles index 3 onwards) into groups of 3
  const remainingArticles = articles.slice(3)
  const chunks = []
  for (let i = 0; i < remainingArticles.length; i += 3) {
    chunks.push(remainingArticles.slice(i, i + 3))
  }

  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* ── Standardized Responsive Site Header ── */}
      <SiteHeader section="journal" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {articles.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xs p-8 max-w-xl mx-auto my-12">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
              OpenBrief Plus
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No essays have been filed under OpenBrief Plus yet. Check back soon.
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
            {/* Signature Section Hero with Big Lead Article & Intersecting Crossroads Watermark */}
            <SectionHeroBlock
              section="journal"
              title="OpenBrief Plus"
              href="/journal"
              layout="featured-right"
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
