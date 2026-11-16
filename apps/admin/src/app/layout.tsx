import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Author Studio — The Open Brief',
  description: 'Editorial Studio for Authors and Editors of The Open Brief.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
