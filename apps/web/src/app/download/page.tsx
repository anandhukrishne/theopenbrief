import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Download — The Open Brief',
  description: 'The Open Brief Desktop App is currently in development.',
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={null} />

      <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0D1320] mb-6 shadow-xs">
          {/* Newspaper / Article Icon */}
          <svg
            className="w-7 h-7 text-neutral-900 dark:text-neutral-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-8">
          Desktop App in Development
        </h1>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-sans font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
        >
          Back
        </Link>
      </div>
    </main>
  )
}
