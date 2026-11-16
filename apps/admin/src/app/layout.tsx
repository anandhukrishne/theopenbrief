import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Author Studio — The Open Brief',
  description: 'Editorial Studio for Authors and Editors of The Open Brief.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
