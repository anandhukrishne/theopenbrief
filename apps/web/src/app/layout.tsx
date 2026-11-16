import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'The Open Brief',
    template: '%s — The Open Brief',
  },
  description: 'Premium journal, short stories, web explainers and tech bites.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'The Open Brief',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-white text-gray-900 antialiased">
        <div className="flex-1">{children}</div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-100 bg-gray-50/60 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-gray-200/60">
              <div>
                <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain mb-3" />
                <p className="text-sm text-gray-500 max-w-sm">
                  An independent publication featuring long-form essays in OpenBrief Plus, technical breakdowns in TechnoBrief, and visual narratives in TOB Explainers.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Publications</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><Link href="/journal" className="hover:text-black">OpenBrief Plus</Link></li>
                    <li><Link href="/explainers" className="hover:text-black">TOB Explainers</Link></li>
                    <li><Link href="/tech" className="hover:text-black">TechnoBrief</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">About</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><Link href="/about" className="hover:text-black">About Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <p>© {new Date().getFullYear()} The Open Brief. All rights reserved.</p>
              <div className="flex gap-4">
                <span>Independent Editorial</span>
                <span>•</span>
                <span>Adoor / Global</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
