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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen flex flex-col justify-between">
        <div className="flex-1">{children}</div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-100 bg-gray-50/50 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-gray-200/60">
              <div>
                <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain mb-3" />
                <p className="text-sm text-gray-500 max-w-sm">
                  An independent digital publication featuring thoughtful essays, short fiction, web explainers, and technology bites.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Sections</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><Link href="/journal" className="hover:text-black">Journal</Link></li>
                    <li><Link href="/stories" className="hover:text-black">Short Stories</Link></li>
                    <li><Link href="/explainers" className="hover:text-black">Explainers</Link></li>
                    <li><Link href="/tech" className="hover:text-black">Tech Bites</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Editorial</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><a href="/admin" className="hover:text-black">Author Portal</a></li>
                    <li><Link href="/about" className="hover:text-black">About Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <p>© {new Date().getFullYear()} The Open Brief. All rights reserved.</p>
              <div className="flex gap-6">
                <span>Independent Editorial</span>
                <span>•</span>
                <span>Bengaluru / Global</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
