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
            
            {/* ── Desktop Layout (lg and up) ── */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-10 pb-12 border-b border-neutral-300 dark:border-neutral-800 items-start">
                
                {/* Left Column: Logo + Paragraph + Contact, About & Follow */}
                <div className="col-span-5 space-y-6">
                  <Link href="/" className="inline-block">
                    <img src="/logo.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain dark:hidden" />
                    <img src="/logo-white.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain hidden dark:block" />
                  </Link>

                  {/* Paragraph Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm pt-3">
                    An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                  </p>

                  {/* Contact, About and Follow */}
                  <div className="pt-6 space-y-2">
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
                <div className="col-span-3 space-y-3">
                  <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-4">
                    Sections
                  </h4>
                  <ul className="space-y-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                      <Link href="/general" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block text-neutral-500">
                        General
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Keywords Search Box with Watermark Art */}
                <div className="col-span-4 relative overflow-visible pt-2 pr-6 lg:pr-8">
                  {/* Watermark Graphic */}
                  <div className="absolute -right-4 -top-8 w-48 sm:w-52 pointer-events-none select-none z-10">
                    <img
                      src="/footer-art.png"
                      alt=""
                      className="w-full h-auto object-contain opacity-90 dark:opacity-80"
                    />
                  </div>

                  {/* Keywords Search Container */}
                  <div className="relative z-0 min-h-[220px] flex flex-col justify-between">
                    <div className="space-y-3 max-w-[70%]">
                      <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
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

              {/* Desktop Bottom Bar: Copyright on Left, Legal & Credits on Right */}
              <div className="pt-6 flex items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
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

            {/* ── Mobile Layout (< lg) ── */}
            <div className="block lg:hidden space-y-6">
              {/* Row 1: Logo on Left, Watermark Art on Top Right */}
              <div className="flex items-start justify-between relative">
                <div className="space-y-3 max-w-[70%]">
                  <Link href="/" className="inline-block">
                    <img src="/logo.png" alt="TheOpenBrief.app" className="h-7 w-auto object-contain dark:hidden" />
                    <img src="/logo-white.png" alt="TheOpenBrief.app" className="h-7 w-auto object-contain hidden dark:block" />
                  </Link>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                  </p>
                </div>

                <div className="w-24 sm:w-28 shrink-0 pointer-events-none select-none -mt-3">
                  <img
                    src="/footer-art.png"
                    alt=""
                    className="w-full h-auto object-contain opacity-90 dark:opacity-80"
                  />
                </div>
              </div>

              {/* Row 2: Sections */}
              <div className="pt-2 space-y-2.5">
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Sections
                </h4>
                <ul className="space-y-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
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
                    <Link href="/general" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block text-neutral-500">
                      General
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Row 3: Keywords Search */}
              <div className="pt-2">
                <div className="space-y-2.5">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Keywords search
                  </h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Explore dispatches by subject, technical breakdown, or cultural inquiry:
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono pt-1">
                    <Link
                      href="/explainers"
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                    >
                      #Economics
                    </Link>
                    <Link
                      href="/tech"
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                    >
                      #Software
                    </Link>
                    <Link
                      href="/cinebrief"
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                    >
                      #Cinema
                    </Link>
                    <Link
                      href="/journal"
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                    >
                      #Culture
                    </Link>
                    <Link
                      href="/tech"
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors rounded-xs"
                    >
                      #Engineering
                    </Link>
                  </div>
                </div>
              </div>

              {/* Row 4: Contact, About & Follow (moved below keywords per image 2) */}
              <div className="pt-3 space-y-2 border-t border-neutral-200 dark:border-neutral-800">
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

              {/* Row 5: Mobile Legal Links & Copyright */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">
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
                <div className="flex flex-col gap-1 pt-1">
                  <p>© TheOpenBrief. All rights reserved.</p>
                  <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                    <span>Global</span>
                    <span>•</span>
                    <span>Developed by 45 STUDioS</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </footer>
      </body>
    </html>
  )
}
