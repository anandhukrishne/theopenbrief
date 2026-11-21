import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Terms of Use',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={null} />

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-sans text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
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
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">3. User Conduct</h2>
            <p>
              Users must not attempt to gain unauthorized access to the Author Studio, impersonate other authors, or submit content that is defamatory, obscene, or violates the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">4. Editorial Standards</h2>
            <p>
              The Open Brief reserves the right to edit, modify, or remove any content that does not meet our editorial standards. The editorial team has final authority over publication decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">5. Limitation of Liability</h2>
            <p>
              The Open Brief is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from the use or inability to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the site after changes means acceptance of the updated terms.
            </p>
          </section>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans font-medium pt-4 border-t border-neutral-200 dark:border-neutral-800">
          Last updated on November 21, 2026
        </p>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
          <Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
