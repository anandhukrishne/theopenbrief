import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Download — The Open Brief',
  description: 'Download The Open Brief desktop app. Coming soon on Microsoft Store.',
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] dark:bg-[#080C14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <SiteHeader section={null} />

      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0D1320] mb-6 shadow-xs">
          {/* Microsoft Windows / Store grid icon */}
          <svg className="w-7 h-7 text-neutral-900 dark:text-neutral-100 fill-current" viewBox="0 0 24 24">
            <path d="M3 3h8.5v8.5H3V3zm9.5 0H21v8.5h-8.5V3zM3 12.5h8.5V21H3v-8.5zm9.5 0H21V21h-8.5v-8.5z" />
          </svg>
        </div>

        <span className="font-sans text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 font-bold block mb-3">
          Desktop App
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
          Coming soon on Microsoft Store
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed mb-8">
          A distraction-free native reading experience for The Open Brief is currently in development for Windows via the Microsoft Store.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-sans font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </main>
  )
}
