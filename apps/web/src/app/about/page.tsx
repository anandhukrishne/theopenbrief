import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-semibold tracking-wide uppercase text-neutral-600">
            <Link href="/journal" className="hover:text-black transition-colors">OpenBrief Plus</Link>
            <Link href="/explainers" className="hover:text-black transition-colors">TOB Explainers</Link>
            <Link href="/tech" className="hover:text-black transition-colors">TechnoBrief</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
          Publication Colophon & Manifesto
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-8 tracking-tight text-neutral-900 leading-tight">
          A Deliberate Antidote to Ephemeral Noise.
        </h1>

        <p className="text-xl sm:text-2xl text-neutral-600 leading-relaxed mb-10 font-normal border-l-2 border-neutral-900 pl-6">
          The Open Brief is an independent publication dedicated to sustained attention, long-form inquiry, architectural explainers, and technical intelligence.
        </p>

        <div className="space-y-6 text-neutral-800 leading-relaxed text-base sm:text-lg">
          <p>
            The modern web suffers from an abundance of velocity and a poverty of synthesis. We consume hundreds of fragmented notifications daily, yet find ourselves increasingly unequipped to reason through foundational shifts in software, human thought, and digital institutions.
          </p>
          <p>
            The Open Brief is organized around three distinct editorial pillars, plus standalone dispatches:
          </p>
          <ul className="space-y-4 my-6 pl-4 border-l border-neutral-200 text-sm sm:text-base">
            <li>
              <strong className="font-semibold text-neutral-900">OpenBrief Plus:</strong> Philosophical essays, cultural commentary, and narrative inquiries examining human agency in an algorithmic age.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900">TOB Explainers:</strong> Structural deep dives breaking down complex protocols, economic mechanisms, and system architectures into clear mental models.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900">TechnoBrief:</strong> Compact, high-density engineering dispatches on compilers, distributed state, edge networks, and foundational software engineering.
            </li>
            <li>
              <strong className="font-semibold text-neutral-900">Standalone Dispatches:</strong> Independent features, investigative notes, and special editorial dispatches.
            </li>
          </ul>
          <p>
            Headquartered out of Adoor, Kerala, and read globally, our publishing architecture is intentionally self-reliant, zero-card, and built to endure.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Adoor / Global</span>
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            ← Back to Front Page
          </Link>
        </div>
      </div>
    </main>
  )
}
