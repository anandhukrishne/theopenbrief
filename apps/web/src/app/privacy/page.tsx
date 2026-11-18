import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={null} />

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">1. Information We Collect</h2>
            <p>
              The Open Brief collects minimal data necessary to operate the publication. When you visit our site, we may collect standard web server logs including your IP address, browser type, and pages visited. If you create an Author Studio account, we store your name, email address, and authentication credentials through Google Sign-In.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">2. How We Use Information</h2>
            <p>
              We use collected information solely to operate and improve The Open Brief. Author account data is used for authentication, article attribution, and editorial communication. We do not sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">3. Cookies &amp; Local Storage</h2>
            <p>
              We use browser local storage to persist your theme preference (light/dark mode). Authentication sessions are managed via secure HTTP-only cookies. We do not use third-party tracking cookies or analytics pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">4. Data Security</h2>
            <p>
              All data is transmitted over HTTPS. Authentication is handled through Firebase Auth with Google Sign-In. Article data and user profiles are stored in Neon PostgreSQL with industry-standard security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">5. Third-Party Services</h2>
            <p>
              We use the following third-party services: Google Firebase (authentication), Neon (database hosting), and Vercel (site hosting). Each service has its own privacy policy governing their handling of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">6. Your Rights</h2>
            <p>
              You may request deletion of your account and associated data by contacting our editorial team. Authors retain ownership of their contributed content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:anandhu.krishne@theopenbrief.app" className="font-semibold underline">
                anandhu.krishne@theopenbrief.app
              </a>.
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
