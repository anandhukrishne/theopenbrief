import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'The Open Brief — Independent Journal & Dispatches',
    template: '%s — The Open Brief',
  },
  description: 'An independent digital publication featuring long-form essays in OpenBrief Plus, architectural explainers in TOB Explainers, and systems analysis in TechnoBrief.',
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
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
        <div className="flex-1">{children}</div>

        {/* ── Editorial Footer ── */}
        <footer className="border-t border-neutral-200 bg-white mt-24">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200">
              <div className="md:col-span-5 space-y-4">
                <Link href="/" className="inline-block">
                  <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
                </Link>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-sm font-serif">
                  A journal of ideas, architectural breakdowns, and technological inquiry. Free, open, and deliberately unhurried.
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono uppercase tracking-wider">
                  <span>Adoor / Global</span>
                  <span>•</span>
                  <span>Est. 2026</span>
                </div>
              </div>

              <div className="md:col-span-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
                  Pillars & Sections
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/journal" className="group flex items-center justify-between text-neutral-700 hover:text-black">
                      <span className="font-medium">OpenBrief Plus</span>
                      <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">Long-form essays ↗</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/explainers" className="group flex items-center justify-between text-neutral-700 hover:text-black">
                      <span className="font-medium">TOB Explainers</span>
                      <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">Visual deep dives ↗</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/tech" className="group flex items-center justify-between text-neutral-700 hover:text-black">
                      <span className="font-medium">TechnoBrief</span>
                      <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">Systems & tech ↗</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-3">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
                  Colophon
                </h4>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li>
                    <Link href="/about" className="hover:text-black transition-colors">
                      About the Publication
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://admin.theopenbrief.app"
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-500 hover:text-black transition-colors"
                    >
                      Author Studio ↗
                    </a>
                  </li>
                  <li>
                    <span className="text-xs text-neutral-400">Zero-Card Architecture</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
              <p>© {currentYear} The Open Brief. Published independently.</p>
              <div className="flex items-center gap-6">
                <span>Light Edition</span>
                <span>•</span>
                <span>cdn.theopenbrief.app</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
