import SectionPageView from '@/components/SectionPageView'

export const revalidate = 60

export const metadata = {
  title: 'General',
  description: 'Independent journalism, culture, and standalone dispatches.',
}

export default function GeneralPage() {
  return (
    <SectionPageView
      section="general"
      title="General"
      href="/general"
      layout="featured-left"
      emptyDescription="No general articles published yet. Check back soon."
    />
  )
}
