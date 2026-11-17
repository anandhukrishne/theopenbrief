import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'The Open Brief — Independent Journal & Dispatches',
    template: '%s — The Open Brief',
  },
  description: 'An independent digital publication featuring long-form essays in OpenBrief Plus, architectural explainers in TOB Explainers, systems analysis in TechnoBrief, cinematic essays in CinēBrief, and standalone dispatches.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'The Open Brief',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('tob-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 antialiased font-sans">
        <div className="flex-1">{children}</div>

        {/* ── Universal Site-Wide Footer ── */}
        <footer className="border-t border-neutral-300 dark:border-neutral-800 bg-[#F9FAFB] dark:bg-[#090D17] mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-neutral-300 dark:border-neutral-800 items-start">
              
              {/* Left Column: Logo + Paragraph (no box, clean margin) + Contact, About & Follow */}
              <div className="lg:col-span-5 space-y-4">
                <Link href="/" className="inline-block">
                  <img src="/logo.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain dark:hidden" />
                  <img src="/logo-white.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain hidden dark:block" />
                </Link>

                {/* Paragraph Description */}
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm pt-1">
                  An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                </p>

                {/* Contact, About and Follow */}
                <div className="pt-3 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
                    Contact, About &amp; Follow
                  </span>
                  <div className="text-xs font-mono space-y-1.5">
                    <div>
                      <span className="text-neutral-400">Email: </span>
                      <a
                        href="mailto:anandhu.krishne@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
                      >
                        anandhu.krishne@theopenbrief.app
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-neutral-600 dark:text-neutral-400">
                      <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors underline">
                        About
                      </Link>
                      <span>•</span>
                      <a
                        href="https://admin.theopenbrief.app"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-black dark:hover:text-white transition-colors underline"
                      >
                        Author Studio ↗
                      </a>
                      <span>•</span>
                      <Link href="/rss" className="hover:text-black dark:hover:text-white transition-colors underline">
                        RSS Feed
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Sections */}
              <div className="lg:col-span-3 space-y-3">
                <h4 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 mb-4">
                  Sections
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <li>
                    <Link href="/journal" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                      OpenBrief Plus
                    </Link>
                  </li>
                  <li>
                    <Link href="/explainers" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                      TOB Explainers
                    </Link>
                  </li>
                  <li>
                    <Link href="/tech" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                      TechnoBrief
                    </Link>
                  </li>
                  <li>
                    <Link href="/cinebrief" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                      CinēBrief
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block text-neutral-500">
                      Standalone Dispatches
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Right Column: Keywords Search Box with Watermark Art (shifted slightly inwards from right) */}
              <div className="lg:col-span-4 relative overflow-visible pt-2 pr-2 sm:pr-6 lg:pr-8">
                {/* Watermark Graphic: Exact PNG without axis shifting or position changes */}
                <div className="absolute -right-2 sm:-right-4 -top-8 w-44 sm:w-52 pointer-events-none select-none z-10">
                  <img
                    src="/footer-art.png"
                    alt=""
                    className="w-full h-auto object-contain opacity-90 dark:opacity-80"
                  />
                </div>

                {/* Keywords Search Container */}
                <div className="relative z-0 p-6 bg-neutral-200/50 dark:bg-neutral-900/60 border border-neutral-300/80 dark:border-neutral-800 rounded-sm min-h-[220px] flex flex-col justify-between">
                  <div className="space-y-3 max-w-[70%]">
                    <h4 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
                      Keywords search
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Explore dispatches by subject, technical breakdown, or cultural inquiry:
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 relative z-20">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      <Link
                        href="/explainers"
                        className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                      >
                        #Economics
                      </Link>
                      <Link
                        href="/tech"
                        className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                      >
                        #Software
                      </Link>
                      <Link
                        href="/cinebrief"
                        className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                      >
                        #Cinema
                      </Link>
                      <Link
                        href="/journal"
                        className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                      >
                        #Culture
                      </Link>
                      <Link
                        href="/tech"
                        className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                      >
                        #Engineering
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar: Copyright on Left, Legal & Credits on Right */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <p>© TheOpenBrief. All rights reserved.</p>

              <div className="flex items-center gap-4 text-neutral-400">
                <span>Global</span>
                <span>•</span>
                <span>Developed by 45 STUDioS</span>
              </div>

              <div className="flex items-center gap-6">
                <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Terms
                </Link>
                <Link href="/rss" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  RSS
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
