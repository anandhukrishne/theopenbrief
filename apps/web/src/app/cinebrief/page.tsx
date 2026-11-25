import SectionPageView from '@/components/SectionPageView'

export const revalidate = 3600

export const metadata = {
  title: 'CinēBrief',
  description: 'In-depth reviews, cinema craft, and thoughtful critiques of movies and television.',
}

export default function CineBriefPage() {
  return (
    <SectionPageView
      section="cinebrief"
      title="CinēBrief"
      href="/cinebrief"
      layout="featured-right"
      emptyDescription="No film or television essays have been published yet. Check back soon."
    />
  )
}
