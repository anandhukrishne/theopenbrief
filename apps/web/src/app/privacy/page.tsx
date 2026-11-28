import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Privacy Policy — The Open Brief',
  description: 'How The Open Brief handles reader privacy, newsletter subscriptions, and author data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={null} />

      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="font-sans text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 font-bold">
          Legal &amp; Trust
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Privacy Policy
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-serif italic leading-relaxed mb-12 border-l-2 border-red-600 dark:border-red-400 pl-5">
          We built The Open Brief to respect your attention and your privacy—zero ad trackers, zero third-party behavioral pixels, and minimal data collection.
        </p>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base">
          <section className="py-6 first:pt-0">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              1. Information We Collect
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              The Open Brief collects only the minimal data required to operate the publication. When you browse articles, standard server logs (such as IP address, user agent, and requested path) may be processed temporarily for security and reliability. If you subscribe to our weekly newsletter, we store your email address. For editorial staff using Author Studio, we store your name, email address, bio, tag, avatar, and authentication state via Supabase Auth (Email, Password, and OTP).
            </p>
          </section>

          <section className="py-6">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              2. How We Use Information
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Newsletter email addresses are used exclusively by our editorial desk to send weekly digests of newly published articles. Author account data is used strictly for authentication, byline attribution, and editorial management. We never sell, rent, or trade your personal information with third parties.
            </p>
          </section>

          <section className="py-6">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              3. Cookies &amp; Local Storage
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use browser <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-sans">localStorage</code> solely to remember your light or dark theme preference. For Author Studio staff, authentication sessions are secured using HTTP-only <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-sans">openbrief_session</code> cookies. We do not use third-party advertising cookies or cross-site tracking pixels.
            </p>
          </section>

          <section className="py-6">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              4. Data Security &amp; Infrastructure
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              All traffic is encrypted over HTTPS. Staff authentication, hashed credentials, profiles, articles, and subscriber lists are hosted on Supabase PostgreSQL with row-level security controls, alongside Vercel and Cloudflare for edge delivery and protection.
            </p>
          </section>

          <section className="py-6">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              5. Your Rights &amp; Unsubscribing
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You may unsubscribe from our newsletter or request removal of your email address or author profile at any time. Authors retain ownership of their contributed articles.
            </p>
          </section>

          <section className="py-6">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
              6. Contact
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              For privacy inquiries, data deletion requests, or questions, contact our editorial desk at{' '}
              <a
                href="mailto:support1@theopenbrief.app"
                className="font-semibold text-neutral-900 dark:text-neutral-100 underline decoration-red-600/60 dark:decoration-red-400/60 underline-offset-4 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                support1@theopenbrief.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
          <span>Last updated: November 2026</span>
          <Link
            href="/terms"
            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  )
}
