'use client'
import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_LINKS = [
  { label: 'OPENBRIEF PLUS', href: '/journal' },
  { label: 'TOB EXPLAINERS', href: '/explainers' },
  { label: 'TECHNOBRIEF', href: '/tech' },
  { label: 'CINĒBRIEF', href: '/cinebrief' },
  { label: 'GENERAL', href: '/general' },
  { label: 'ABOUT', href: '/about' },
]

export default function HomeNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#0B101B]">
      {/* Desktop nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-4 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-800 dark:text-neutral-200">
        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile: Hamburger menu button on left, ThemeToggle on right */}
        <div className="md:hidden w-full flex items-center justify-between">
          <button
            type="button"
            className="p-1.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            )}
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B101B] px-3 py-3 flex flex-col gap-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm font-bold tracking-wider uppercase px-4 py-2.5 rounded-full bg-red-600 text-white shadow-xs transition-colors"
          >
            HOME
          </Link>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-bold tracking-wider uppercase px-4 py-2.5 rounded-full text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
