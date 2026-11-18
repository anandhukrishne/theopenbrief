import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'About The Open Brief',
  description: 'Origins and manifesto of The Open Brief.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section="about" />

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Origins and Manifesto
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-8 tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          A deliberate attempt at removing the harm that social media is doing to society.
        </h1>

        <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 font-normal border-l-2 border-neutral-900 dark:border-neutral-100 pl-6">
          The Open Brief is an independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
        </p>

        <div className="space-y-6 text-neutral-800 dark:text-neutral-200 leading-relaxed text-base sm:text-lg">
          <p>
            The modern web is full of content that is repetitive and of extremely low value. We receive hundreds of notifications daily, yet find ourselves more and more unable to concentrate or write a thoughtful piece about what we know. Sure, memes and reels touch on current affairs, but they do so in an effort to increase watch time, not the quality of the content itself.
          </p>
          <p>
            The Open Brief was started to address these issues directly. To help people step away from social media and regain their focus, we also run weekly quizzes and short challenges designed to bring sustained attention back.
          </p>
          <p>
            The publication consists of the following sections:
          </p>
          <ul className="space-y-4 my-6 pl-4 border-l border-neutral-200 dark:border-neutral-800 text-sm sm:text-base">
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">OpenBrief Plus:</strong> Philosophical essays, cultural commentary, and investigative journals.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TOB Explainers:</strong> Visual deep dives that break down topics across economics, software engineering, science, and systems.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TechnoBrief:</strong> Recent technological advancements, engineering insights, and navigating digital-life balance.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">CinēBrief:</strong> Reviews and breakdowns of the latest movies, shows, and series.
            </li>
          </ul>
          <p>
            Built with a focus on simplicity, our platform is clean, self-reliant, and made to last.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Global</span>
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
