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

        {/* ── Editorial Colophon Footer (Site-Wide) ── */}
        <footer className="border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0A0F1A] mt-24">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-200 dark:border-neutral-800">
              {/* Col 1: Logo & Contact */}
              <div className="md:col-span-4 space-y-4">
                <Link href="/" className="inline-block">
                  <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain dark:hidden" />
                  <img src="/logo-white.png" alt="The Open Brief" className="h-7 w-auto object-contain hidden dark:block" />
                </Link>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
                  An independent journal of ideas, architectural breakdowns, technological inquiries, and cinematic arts.
                </p>
                <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-sm space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
                    Contact Newsroom
                  </span>
                  <a
                    href="mailto:editorial@theopenbrief.app"
                    className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 hover:underline block"
                  >
                    editorial@theopenbrief.app
                  </a>
                </div>
              </div>

              {/* Col 2: Pillars */}
              <div className="md:col-span-3">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 font-semibold">
                  Pillars &amp; Sections
                </h4>
                <ul className="space-y-2.5 text-xs font-mono">
                  <li>
                    <Link href="/journal" className="hover:text-black dark:hover:text-white transition-colors">
                      → OpenBrief Plus
                    </Link>
                  </li>
                  <li>
                    <Link href="/explainers" className="hover:text-black dark:hover:text-white transition-colors">
                      → TOB Explainers
                    </Link>
                  </li>
                  <li>
                    <Link href="/tech" className="hover:text-black dark:hover:text-white transition-colors">
                      → TechnoBrief
                    </Link>
                  </li>
                  <li>
                    <Link href="/cinebrief" className="hover:text-black dark:hover:text-white transition-colors">
                      → CinēBrief
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Colophon & Studio */}
              <div className="md:col-span-2">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 font-semibold">
                  Colophon
                </h4>
                <ul className="space-y-2.5 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  <li>
                    <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://admin.theopenbrief.app"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      Author Studio ↗
                    </a>
                  </li>
                  <li>
                    <Link href="/sitemap" className="hover:text-black dark:hover:text-white transition-colors">
                      Sitemap
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 4: Legal & Art */}
              <div className="md:col-span-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 font-semibold">
                    Legal
                  </h4>
                  <ul className="space-y-2.5 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    <li>
                      <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
                        Terms of Use
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-neutral-400 fill-current" viewBox="0 0 24 24">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <svg className="w-8 h-8 text-rose-400 fill-current" viewBox="0 0 100 100">
                    <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
                  </svg>
                  <svg className="w-6 h-6 text-indigo-400 fill-current" viewBox="0 0 100 100">
                    <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom rule */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
              <p>© {currentYear} The Open Brief. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span>Adoor / Global</span>
                <span>•</span>
                <span>Dev 45 studios</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
