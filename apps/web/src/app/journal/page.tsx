import SectionPageView from '@/components/SectionPageView'

export const revalidate = 3600

export const metadata = {
  title: 'OpenBrief Plus',
  description: 'Long-form essays, dispatches, and thoughtful cultural commentary.',
}

export default function JournalPage() {
  return (
    <SectionPageView
      section="journal"
      title="OpenBrief Plus"
      href="/journal"
      layout="featured-right"
      emptyDescription="No stories have been published in OpenBrief Plus yet. Check back soon for essays and dispatches."
    />
  )
}
