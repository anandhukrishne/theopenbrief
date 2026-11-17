import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Terms of Use',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <header className="border-b border-neutral-200 dark:border-neutral-800 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain dark:hidden" />
            <img src="/logo-white.png" alt="The Open Brief" className="h-7 w-auto object-contain hidden dark:block" />
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
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
          Terms of Use
        </h1>

        <div className="space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using The Open Brief (theopenbrief.app), you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">2. Content Ownership</h2>
            <p>
              All articles, essays, and editorial content published on The Open Brief are the intellectual property of their respective authors and The Open Brief. Reproduction, redistribution, or commercial use of content without written permission is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">3. Author Contributions</h2>
            <p>
              Authors who contribute through the Author Studio retain moral rights to their work. By publishing on The Open Brief, authors grant the publication a non-exclusive license to display, distribute, and promote their content on the platform and its associated channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">4. User Conduct</h2>
            <p>
              Users must not attempt to gain unauthorized access to the Author Studio, impersonate other authors, or submit content that is defamatory, obscene, or violates the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">5. Editorial Standards</h2>
            <p>
              The Open Brief reserves the right to edit, modify, or remove any content that does not meet our editorial standards. The editorial team has final authority over publication decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">6. Limitation of Liability</h2>
            <p>
              The Open Brief is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from the use or inability to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <p className="text-sm text-neutral-400 font-mono pt-4 border-t border-neutral-200 dark:border-neutral-800">
            Last updated: November 2026 · Global
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
