import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Author Studio — TheOpenBrief',
  description: 'Editorial Studio for Authors and Editors of TheOpenBrief.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${plusJakartaSans.variable} ${jetbrainsMono.variable}`} style={{ colorScheme: 'light' }}>
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
