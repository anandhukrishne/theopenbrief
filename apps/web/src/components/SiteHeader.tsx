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

const SECTION_LOGOS: Record<string, { light: string; dark: string; alt: string }> = {
  journal: {
    light: '/logo-openbrief-plus.png',
    dark: '/logo-openbrief-plus-white.png',
    alt: 'OpenBrief Plus',
  },
  explainers: {
    light: '/logo-tob-explainers.png',
    dark: '/logo-tob-explainers-white.png',
    alt: 'TOB Explainers',
  },
  tech: {
    light: '/logo-technobrief.png',
    dark: '/logo-technobrief-white.png',
    alt: 'TechnoBrief',
  },
  cinebrief: {
    light: '/logo-cinebrief.png',
    dark: '/logo-cinebrief-white.png',
    alt: 'CinēBrief',
  },
}

export default function SiteHeader({ section }: { section?: string | null }) {
  const [open, setOpen] = useState(false)
  const sectionLogo = section ? SECTION_LOGOS[section] : null

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand or Section Logo */}
        <Link href={section && SECTION_LOGOS[section] ? `/${section}` : '/'} className="shrink-0 flex items-center">
          {sectionLogo ? (
            <>
              <img
                src={sectionLogo.light}
                alt={sectionLogo.alt}
                className="h-7 sm:h-8 w-auto object-contain dark:hidden"
              />
              <img
                src={sectionLogo.dark}
                alt={sectionLogo.alt}
                className="h-7 sm:h-8 w-auto object-contain hidden dark:block"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-wider uppercase">
          {NAV_LINKS.map((l) => {
            const isActive = section === l.section
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-red-600 dark:text-red-400 font-extrabold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400'
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
            className="md:hidden p-1.5 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setOpen((v) => !v)}
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
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B101B] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => {
            const isActive = section === l.section
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-bold tracking-wider uppercase py-2.5 border-b border-neutral-100 dark:border-neutral-800/60 last:border-b-0 transition-colors ${
                  isActive
                    ? 'text-red-600 dark:text-red-400 font-extrabold'
                    : 'text-neutral-800 dark:text-neutral-200 hover:text-red-600 dark:hover:text-red-400'
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
