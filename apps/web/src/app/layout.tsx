import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Merriweather, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'The Open Brief — Independent Journal & Dispatches',
    template: '%s — The Open Brief',
  },
  description: 'An independent digital publication featuring long-form essays in OpenBrief Plus, architectural explainers in TOB Explainers, systems analysis in TechnoBrief, cinematic essays in CinēBrief, and standalone articles.',
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
    <html lang="en" className={`${plusJakartaSans.variable} ${merriweather.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
              <div className="grid grid-cols-12 gap-8 pb-12 border-b border-neutral-300 dark:border-neutral-800 items-start">
                
                {/* Col 1 (col-span-4): About Brand */}
                <div className="col-span-4 space-y-5 pr-6">
                  <Link href="/" className="inline-block">
                    <img src="/logo.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain dark:hidden" />
                    <img src="/logo-white.png" alt="TheOpenBrief.app" className="h-8 w-auto object-contain hidden dark:block" />
                  </Link>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md pt-1">
                    An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                  </p>
                </div>

                {/* Col 2 (col-span-3): Sections */}
                <div className="col-span-3 space-y-4">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Sections
                  </span>
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
                      <Link href="/general" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                        General
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Col 3 (col-span-3): Contact Us */}
                <div className="col-span-3 space-y-4">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Contact Us
                  </span>
                  <div className="text-xs font-sans space-y-3">
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500 block mb-1">Editorial Desk:</span>
                      <a
                        href="mailto:anandhu.krishne@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block break-all"
                      >
                        anandhu.krishne@theopenbrief.app
                      </a>
                      <a
                        href="mailto:sooryakiran@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block mt-1 break-all"
                      >
                        sooryakiran@theopenbrief.app
                      </a>
                    </div>
                    <div className="pt-2 flex flex-col gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                      <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors underline">
                        About
                      </Link>
                      <a
                        href="https://admin.theopenbrief.app"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-black dark:hover:text-white transition-colors underline"
                      >
                        Author Studio ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Col 4 (col-span-2): Footer Art, positioned away to the right in same linear row */}
                <div className="col-span-2 flex justify-end items-start pt-1 pointer-events-none select-none">
                  <img
                    src="/footer-art.png"
                    alt=""
                    className="w-28 h-auto object-contain opacity-80 dark:opacity-70"
                  />
                </div>
              </div>

              {/* Desktop Bottom Bar: Copyright on Left, Legal & Credits on Right */}
              <div className="pt-6 flex items-center justify-between gap-4 text-xs font-sans text-neutral-500 dark:text-neutral-400 font-medium">
                <p>© {currentYear} TheOpenBrief. All rights reserved.</p>

                <div className="flex items-center gap-4 text-neutral-400">
                  <span>Global</span>
                  <span>•</span>
                  <span>
                    Developed by{' '}
                    <a
                      href="https://anandhukrishne.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline transition-colors"
                    >
                      45 STUDioS
                    </a>
                  </span>
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
              
              {/* Brand Section */}
              <div className="space-y-3 text-left px-4">
                <Link href="/" className="inline-block">
                  <img src="/logo.png" alt="TheOpenBrief.app" className="h-7 w-auto object-contain dark:hidden" />
                  <img src="/logo-white.png" alt="TheOpenBrief.app" className="h-7 w-auto object-contain hidden dark:block" />
                </Link>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
                  An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                </p>
              </div>

              {/* Centered Footer Art illustration between brand and links */}
              <div className="flex justify-center py-1 pointer-events-none select-none">
                <img
                  src="/footer-art.png"
                  alt=""
                  className="w-24 h-auto object-contain opacity-80 dark:opacity-70"
                />
              </div>

              {/* Side-by-side 2-column grid for SECTIONS and CONTACT US */}
              <div className="grid grid-cols-2 gap-6 text-left px-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                {/* Sections Column */}
                <div className="space-y-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Sections
                  </span>
                  <ul className="flex flex-col space-y-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <li>
                      <Link href="/journal" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        OpenBrief Plus
                      </Link>
                    </li>
                    <li>
                      <Link href="/explainers" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        TOB Explainers
                      </Link>
                    </li>
                    <li>
                      <Link href="/tech" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        TechnoBrief
                      </Link>
                    </li>
                    <li>
                      <Link href="/cinebrief" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        CinēBrief
                      </Link>
                    </li>
                    <li>
                      <Link href="/general" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        General
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact Us Column */}
                <div className="space-y-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Contact Us
                  </span>
                  <div className="text-xs font-sans space-y-2">
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500 block mb-1">Editorial Desk:</span>
                      <a
                        href="mailto:anandhu.krishne@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block break-all"
                      >
                        anandhu.krishne@theopenbrief.app
                      </a>
                      <a
                        href="mailto:sooryakiran@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block mt-1 break-all"
                      >
                        sooryakiran@theopenbrief.app
                      </a>
                    </div>
                    <div className="flex flex-col gap-1 pt-1 text-neutral-600 dark:text-neutral-400 font-medium">
                      <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors underline">
                        About
                      </Link>
                      <a
                        href="https://admin.theopenbrief.app"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-black dark:hover:text-white transition-colors underline"
                      >
                        Author Studio ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Legal Links & Copyright */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-xs font-sans text-neutral-500 dark:text-neutral-400 px-4 text-center font-medium">
                <div className="flex items-center justify-center gap-6">
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
                <div className="flex flex-col items-center gap-1 pt-1">
                  <p>© {currentYear} TheOpenBrief. All rights reserved.</p>
                  <div className="flex items-center justify-center gap-2 text-neutral-400 text-[11px]">
                    <span>Global</span>
                    <span>•</span>
                    <span>
                      Developed by{' '}
                      <a
                        href="https://anandhukrishne.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline transition-colors"
                      >
                        45 STUDioS
                      </a>
                    </span>
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