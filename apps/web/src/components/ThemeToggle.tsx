'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('tob-theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tob-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tob-theme', 'light')
    }
  }

  if (!mounted) {
    return <div className="w-7 h-7" />
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light theme"
      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors text-xs flex items-center gap-1.5 font-mono"
    >
      {isDark ? (
        <>
          <span className="text-amber-400">☀️</span>
          <span className="hidden sm:inline text-[11px] font-medium">Light</span>
        </>
      ) : (
        <>
          <span className="text-slate-700">🌙</span>
          <span className="hidden sm:inline text-[11px] font-medium">Dark</span>
        </>
      )}
    </button>
  )
}
