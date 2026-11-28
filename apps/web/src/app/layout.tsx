import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Merriweather, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import BackToTop from '@/components/BackToTop'

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
    default: 'TheOpenBrief — Independent Journal & Dispatches',
    template: '%s — TheOpenBrief',
  },
  description: 'An independent digital publication featuring long-form essays in OpenBrief Plus, architectural explainers in TOB Explainers, systems analysis in TechnoBrief, cinematic essays in CinēBrief, and general articles.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'TheOpenBrief',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'TheOpenBrief',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheOpenBrief — Independent Journal & Dispatches',
    description: 'An independent digital publication featuring long-form essays, explainers, technology, and cinema.',
    images: ['/logo.png'],
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
                var stored = localStorage.getItem('tob-theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 sm:pt-14 sm:pb-8">

            {/* ── Desktop Layout (lg and up) ── */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-8 pb-10 border-b border-neutral-300 dark:border-neutral-800 items-start">

                {/* Col 1 (col-span-5): About Brand + Quick Icons */}
                <div className="col-span-5 space-y-5 pr-6">
                  <Link href="/" className="inline-block">
                    <img src="/tob-mark.png" alt="TheOpenBrief" className="h-9 w-auto object-contain dark:hidden" />
                    <img src="/tob-mark-white.png" alt="TheOpenBrief" className="h-9 w-auto object-contain hidden dark:block" />
                  </Link>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md pt-1">
                    An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                  </p>

                  {/* 4 Quick Editorial Icons: WhatsApp Channel, Download, RSS, Email */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <a
                      href="https://whatsapp.com/channel/0029VbE7ysZLCoX22KRwnq1t"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow our WhatsApp Channel"
                      title="Follow our WhatsApp Channel"
                      className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.391c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.188.109-1.922-.125-.453-.141-1.031-.328-1.766-.656-3.094-1.344-5.109-4.484-5.266-4.688-.156-.203-1.25-1.672-1.25-3.188 0-1.516.797-2.266 1.078-2.578.281-.313.609-.391.813-.391.203 0 .406.016.578.016.188 0 .438-.078.688.531.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.328.391-.469.516-.156.141-.313.297-.141.594.172.297.766 1.266 1.656 2.047 1.141 1.016 2.094 1.328 2.391 1.484.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.141.266.109 1.719.813 2.016.953.297.141.484.219.563.344.078.125.078.719-.172 1.422z" />
                      </svg>
                    </a>
                    <Link
                      href="/download"
                      aria-label="Download App"
                      title="Download App"
                      className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </Link>
                    <Link
                      href="/rss"
                      aria-label="RSS Feed"
                      title="RSS Feed"
                      className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 11a9 9 0 0 1 9 9" />
                        <path d="M4 4a16 16 0 0 1 16 16" />
                        <circle cx="5" cy="19" r="1" />
                      </svg>
                    </Link>
                    <a
                      href="mailto:support1@theopenbrief.app"
                      aria-label="Email Editorial Desk"
                      title="Email Editorial Desk"
                      className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Col 2 (col-span-4): Sections (2-column compact grid) */}
                <div className="col-span-4 space-y-4">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Sections
                  </span>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                    <li>
                      <Link href="/editions" className="hover:text-red-600 dark:hover:text-red-400 transition-colors block">
                        Special Editions
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
                        href="mailto:support1@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block break-all"
                      >
                        support1@theopenbrief.app
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
              <div className="space-y-3 text-left px-2">
                <Link href="/" className="inline-block">
                  <img src="/tob-mark.png" alt="TheOpenBrief" className="h-8 w-auto object-contain dark:hidden" />
                  <img src="/tob-mark-white.png" alt="TheOpenBrief" className="h-8 w-auto object-contain hidden dark:block" />
                </Link>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
                  An independent publication dedicated to in-depth visual explainers, movie and show reviews, and recent technological advancements.
                </p>

                {/* 4 Quick Editorial Icons: WhatsApp Channel, Download, RSS, Email */}
                <div className="flex items-center gap-2.5 pt-1">
                  <a
                    href="https://whatsapp.com/channel/0029VbE7ysZLCoX22KRwnq1t"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow our WhatsApp Channel"
                    title="Follow our WhatsApp Channel"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.391c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.188.109-1.922-.125-.453-.141-1.031-.328-1.766-.656-3.094-1.344-5.109-4.484-5.266-4.688-.156-.203-1.25-1.672-1.25-3.188 0-1.516.797-2.266 1.078-2.578.281-.313.609-.391.813-.391.203 0 .406.016.578.016.188 0 .438-.078.688.531.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.328.391-.469.516-.156.141-.313.297-.141.594.172.297.766 1.266 1.656 2.047 1.141 1.016 2.094 1.328 2.391 1.484.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.141.266.109 1.719.813 2.016.953.297.141.484.219.563.344.078.125.078.719-.172 1.422z" />
                    </svg>
                  </a>
                  <Link
                    href="/download"
                    aria-label="Download App"
                    title="Download App"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </Link>
                  <Link
                    href="/rss"
                    aria-label="RSS Feed"
                    title="RSS Feed"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11a9 9 0 0 1 9 9" />
                      <path d="M4 4a16 16 0 0 1 16 16" />
                      <circle cx="5" cy="19" r="1" />
                    </svg>
                  </Link>
                  <a
                    href="mailto:support1@theopenbrief.app"
                    aria-label="Email Editorial Desk"
                    title="Email Editorial Desk"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* 12-col grid (5 cols Sections, 7 cols Contact Us so email never wraps awkwardly) */}
              <div className="grid grid-cols-12 gap-4 text-left px-2 pt-5 border-t border-neutral-200 dark:border-neutral-800">
                {/* Sections Column */}
                <div className="col-span-5 space-y-3">
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
                    <li>
                      <Link href="/editions" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        Special Editions
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact Us Column */}
                <div className="col-span-7 space-y-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Contact Us
                  </span>
                  <div className="text-xs font-sans space-y-2.5">
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500 block mb-1">Editorial Desk:</span>
                      <a
                        href="mailto:support1@theopenbrief.app"
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline block text-[11px] sm:text-xs whitespace-nowrap"
                      >
                        support1@theopenbrief.app
                      </a>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1 text-neutral-600 dark:text-neutral-400 font-medium">
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
        <BackToTop />
      </body>
    </html>
  )
}