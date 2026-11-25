import SectionPageView from '@/components/SectionPageView'

export const revalidate = 3600

export const metadata = {
  title: 'TOB Explainers',
  description: 'Deep dives and visual storytelling articles free from noise.',
}

export default function ExplainersPage() {
  return (
    <SectionPageView
      section="explainers"
      title="TOB Explainers"
      href="/explainers"
      layout="featured-left"
      emptyDescription="No explainers have been published yet. Check back soon for structural breakdowns."
    />
  )
}
