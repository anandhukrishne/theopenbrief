'use client'
import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_LINKS = [
  { label: 'OPENBRIEF PLUS', href: '/journal', section: 'journal' },
  { label: 'TOB EXPLAINERS', href: '/explainers', section: 'explainers' },
  { label: 'TECHNOBRIEF', href: '/tech', section: 'tech' },
  { label: 'CINĒBRIEF', href: '/cinebrief', section: 'cinebrief' },
  { label: 'GENERAL', href: '/general', section: 'general' },
  { label: 'ABOUT', href: '/about', section: 'about' },
]

export default function SiteHeader({ section }: { section?: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo — always the main logo, never section-specific */}
        <Link href="/" className="shrink-0 flex items-center">
          <img
            src="/logo.png"
            alt="TheOpenBrief.app"
            className="h-7 sm:h-8 w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-white.png"
            alt="TheOpenBrief.app"
            className="h-7 sm:h-8 w-auto object-contain hidden dark:block"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5 text-xs font-bold tracking-wider uppercase">
          {NAV_LINKS.map((l) => {
            const isActive = section === l.section
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white dark:bg-red-600 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls: ThemeToggle + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden p-2 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:scale-95"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="w-5 h-3.5 relative flex flex-col justify-between">
              <span
                className={`block h-[2px] w-full bg-current rounded-full origin-center transition-all duration-300 ease-in-out ${
                  open ? 'translate-y-[6px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current rounded-full transition-all duration-200 ease-in-out ${
                  open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current rounded-full origin-center transition-all duration-300 ease-in-out ${
                  open ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B101B] px-3 py-3 flex flex-col gap-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`text-sm font-bold tracking-wider uppercase px-4 py-2.5 rounded-full transition-colors ${
              !section
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
            }`}
          >
            HOME
          </Link>
          {NAV_LINKS.map((l) => {
            const isActive = section === l.section
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-bold tracking-wider uppercase px-4 py-2.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
