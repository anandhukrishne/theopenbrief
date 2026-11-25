import SectionPageView from '@/components/SectionPageView'

export const revalidate = 3600

export const metadata = {
  title: 'TechnoBrief',
  description: 'Recent technological advancements, engineering breakdowns, and systems analysis.',
}

export default function TechPage() {
  return (
    <SectionPageView
      section="tech"
      title="TechnoBrief"
      href="/tech"
      layout="featured-left"
      emptyDescription="No articles published in TechnoBrief yet. Check back soon for engineering breakdowns."
    />
  )
}
