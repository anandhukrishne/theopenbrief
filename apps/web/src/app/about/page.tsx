import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import NewsletterSignup from '@/components/NewsletterSignup'

export const metadata = {
  title: 'About The Open Brief',
  description: 'Origins and manifesto of The Open Brief.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section="about" />

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-sans text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Origins and Manifesto
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold mb-8 tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          A deliberate attempt at removing the harm that social media is doing to society.
        </h1>

        <blockquote className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 font-serif italic border-l-2 border-red-600 dark:border-red-400 pl-6">
          &ldquo;You can learn new things at any time in your life if you&apos;re willing to be a beginner.&rdquo;
          <footer className="mt-2 not-italic font-sans text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
            — Barbara Sher
          </footer>
        </blockquote>

        <div className="space-y-6 text-neutral-800 dark:text-neutral-200 leading-relaxed text-base sm:text-lg">
          <p>
            Exactly three years ago, I learned the most important lesson of my life: being driven by a grudge only closes doors and drives people away, whereas approaching the world with openness builds something that lasts a lifetime. This is the reason why I chose this name for{' '}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TheOpenBrief</strong>, and the standard we at TOB hold ourselves to before every article is published.
          </p>

          <p>
            Today, the modern web is full of content that is repetitive and of extremely low value. We receive hundreds of notifications daily, yet find ourselves more and more unable to concentrate or write a small paragraph about what we know. Sure, memes and creators skim through current affairs, but they do so in an effort to increase their watch time, not the quality of the content itself. I, too, once was in a place where I could not concentrate on classes because things outside my control had occupied my mind, and I could not write one full paragraph of text without consulting AI. The icing on top was feeling boredom in life, postponing things, and my mind always racing through ten different things at the same time.
          </p>

          <p>
            All of this, along with deteriorating grades, made me quit social media and convinced me that the best way to regain my broken attention span was through patient, start-to-finish reading. I started this explainer publication, along with Sooryakiran and Saikiran, with a simple goal: help any curious reader walk through complex topics from start to finish. We developed four main sections for this publication:
          </p>

          <ul className="space-y-4 my-6 pl-4 border-l border-neutral-200 dark:border-neutral-800 text-sm sm:text-base">
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">OpenBrief Plus:</strong> Essays on philosophy, culture, and investigative journalism.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TOB Explainers:</strong> Deep dives that break down complex topics in economics, science, and engineering.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TechnoBrief:</strong> Articles and updates on technology and its impacts on human life.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">CinēBrief:</strong> Reviews and plot breakdowns of the latest movies, short films, and series.
            </li>
          </ul>

          <p>
            I will handle mostly{' '}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TechnoBrief</strong> alongside Saikiran, and{' '}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TOB Explainers</strong> with Sooryakiran.
          </p>

          <p>
            Whether you are here to understand why capitalism promotes monopoly, explore what happened at Comic Con last week, or learn why GPUs are an important part of Generative AI, welcome to TOB. If you ever want to pitch a topic or share a thought, write to us anytime at{' '}
            <a
              href="mailto:anandhu.krishne@theopenbrief.app"
              className="font-semibold text-neutral-900 dark:text-neutral-100 underline decoration-red-600/60 dark:decoration-red-400/60 underline-offset-4 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              anandhu.krishne@theopenbrief.app
            </a>.
          </p>

          <p className="mt-8 text-sm leading-relaxed">
            Yours,<br />
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">AnandhuKrishne Kurup</strong><br />
            <span className="text-neutral-500 dark:text-neutral-400">Staff Author &amp; Tech Lead at TheOpenBrief</span>
          </p>
        </div>

        <NewsletterSignup />

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}