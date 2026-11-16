import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="The Open Brief"
              className="h-7 w-auto object-contain hidden dark:block"
            />
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
              <Link href="/journal" className="hover:text-black dark:hover:text-white transition-colors">Plus</Link>
              <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">Explainers</Link>
              <Link href="/tech" className="hover:text-black dark:hover:text-white transition-colors">Tech</Link>
              <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">CinēBrief</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Publication Colophon & Manifesto
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-8 tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          A Deliberate Antidote to Ephemeral Noise.
        </h1>

        <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 font-normal border-l-2 border-neutral-900 dark:border-neutral-100 pl-6">
          The Open Brief is an independent publication dedicated to sustained attention, long-form inquiry, architectural explainers, technical intelligence, and cinematic studies.
        </p>

        <div className="space-y-6 text-neutral-800 dark:text-neutral-200 leading-relaxed text-base sm:text-lg">
          <p>
            The modern web suffers from an abundance of velocity and a poverty of synthesis. We consume hundreds of fragmented notifications daily, yet find ourselves increasingly unequipped to reason through foundational shifts in software, human thought, and digital institutions.
          </p>
          <p>
            The Open Brief is organized around four distinct editorial pillars, plus standalone dispatches:
          </p>
          <ul className="space-y-4 my-6 pl-4 border-l border-neutral-200 dark:border-neutral-800 text-sm sm:text-base">
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">OpenBrief Plus:</strong> Philosophical essays, cultural commentary, and narrative inquiries examining human agency in an algorithmic age.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TOB Explainers:</strong> Structural deep dives breaking down complex protocols, economic mechanisms, and system architectures into clear mental models.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">TechnoBrief:</strong> Compact, high-density engineering dispatches on compilers, distributed state, edge networks, and foundational software engineering.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">CinēBrief:</strong> Visual and narrative critiques exploring cinema, screenplays, and cultural representation.
            </li>
          </ul>
          <p>
            Headquartered out of Adoor, Kerala, and read globally, our publishing architecture is intentionally self-reliant, zero-card, and built to endure.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Adoor / Global</span>
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Front Page
          </Link>
        </div>
      </div>
    </main>
  )
}
