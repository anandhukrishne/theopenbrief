'use client'

interface SectionWatermarkProps {
  section: 'explainers' | 'journal' | 'tech' | 'cinebrief' | 'general' | string
  className?: string
}

export default function SectionWatermark({ section, className = '' }: SectionWatermarkProps) {
  switch (section) {
    case 'explainers':
      return (
        <div className={`pointer-events-none select-none z-0 ${className}`}>
          {/* Exact 5-point coral star from mockup (color #FFAAAA, shape, opacity preserved) */}
          <img
            src="/watermark-star.png"
            alt=""
            className="w-full h-full object-contain opacity-85 dark:opacity-95"
          />
        </div>
      )

    case 'journal':
      return (
        <div className={`pointer-events-none select-none z-0 ${className}`}>
          {/* Clean minimalist plus symbol - visible in both light & dark mode */}
          <svg
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-rose-400 fill-rose-400 opacity-60 dark:text-rose-300 dark:fill-rose-300 dark:opacity-85"
          >
            {/* Vertical bar */}
            <rect x="130" y="40" width="40" height="220" rx="4" fill="currentColor" fillOpacity="0.4" />
            {/* Horizontal bar */}
            <rect x="40" y="130" width="220" height="40" rx="4" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </div>
      )

    case 'tech':
      return (
        <div className={`pointer-events-none select-none z-0 text-cyan-700 opacity-55 dark:text-cyan-400 dark:opacity-90 ${className}`}>
          {/* Simple digital art circuit board traces */}
          <svg viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Central Microchip */}
            <rect x="65" y="45" width="50" height="50" rx="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5" />
            <rect x="75" y="55" width="30" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="90" cy="70" r="4" fill="currentColor" fillOpacity="0.8" />

            {/* Top Pins & Traces */}
            <line x1="75" y1="45" x2="75" y2="25" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="75" cy="23" r="3" fill="currentColor" fillOpacity="0.9" />

            <path d="M90 45V20L110 10H140" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="140" cy="10" r="3" fill="currentColor" fillOpacity="0.9" />

            <path d="M105 45V30L120 18H160" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="160" cy="18" r="3" fill="currentColor" fillOpacity="0.9" />

            {/* Left Pins & Traces */}
            <path d="M65 60H35L20 45H10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="10" cy="45" r="3" fill="currentColor" fillOpacity="0.9" />

            <line x1="65" y1="80" x2="25" y2="80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="23" cy="80" r="3" fill="currentColor" fillOpacity="0.9" />

            {/* Right Pins & Traces */}
            <line x1="115" y1="60" x2="155" y2="60" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="157" cy="60" r="3" fill="currentColor" fillOpacity="0.9" />

            <path d="M115 80H135L150 95H170" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="170" cy="95" r="3" fill="currentColor" fillOpacity="0.9" />

            {/* Bottom Pins & Traces */}
            <path d="M75 95V115L60 130H30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="30" cy="130" r="3" fill="currentColor" fillOpacity="0.9" />

            <line x1="90" y1="95" x2="90" y2="125" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="90" cy="127" r="3" fill="currentColor" fillOpacity="0.9" />

            <path d="M105 95V115L120 128H145" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="145" cy="128" r="3" fill="currentColor" fillOpacity="0.9" />
          </svg>
        </div>
      )

    case 'cinebrief':
      return (
        <div className={`pointer-events-none select-none z-0 text-amber-700 opacity-60 dark:text-amber-400 dark:opacity-90 ${className}`}>
          {/* Cinema theatre projector with light beam - crisp and luminous in dark mode */}
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Upper Film Reel */}
            <circle cx="50" cy="40" r="28" stroke="currentColor" strokeWidth="4" strokeOpacity="0.9" />
            <circle cx="50" cy="40" r="8" fill="currentColor" fillOpacity="0.85" />
            <line x1="50" y1="12" x2="50" y2="68" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="22" y1="40" x2="78" y2="40" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="30" y1="20" x2="70" y2="60" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
            <line x1="70" y1="20" x2="30" y2="60" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />

            {/* Lower Film Reel */}
            <circle cx="50" cy="115" r="28" stroke="currentColor" strokeWidth="4" strokeOpacity="0.9" />
            <circle cx="50" cy="115" r="8" fill="currentColor" fillOpacity="0.85" />
            <line x1="50" y1="87" x2="50" y2="143" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="22" y1="115" x2="78" y2="115" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="30" y1="95" x2="70" y2="135" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
            <line x1="70" y1="95" x2="30" y2="135" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />

            {/* Projector Body */}
            <rect x="58" y="55" width="48" height="50" rx="6" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="3.5" />
            <circle cx="82" cy="80" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" strokeOpacity="0.9" />

            {/* Projection Lens Housing */}
            <path d="M106 68L122 62V98L106 92V68Z" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="3" />

            {/* Light Beam / Cone projecting outward */}
            <polygon points="122,64 195,30 195,130 122,96" fill="currentColor" fillOpacity="0.2" />
            <line x1="122" y1="64" x2="195" y2="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.75" />
            <line x1="122" y1="96" x2="195" y2="130" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.75" />
          </svg>
        </div>
      )

    case 'general':
    default:
      return (
        <div className={`pointer-events-none select-none z-0 text-neutral-600 opacity-55 dark:text-neutral-300 dark:opacity-85 ${className}`}>
          {/* Simple digital art stacked broadsheet articles pile */}
          <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Bottom Sheet */}
            <path d="M20 70L80 40L140 70L80 100Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />

            {/* Middle Sheet (slightly offset) */}
            <path d="M20 55L80 25L140 55L80 85Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />

            {/* Top Sheet */}
            <path d="M20 40L80 10L140 40L80 70Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="2.5" />

            {/* Top Sheet Content Lines (Masthead + Columns) */}
            {/* Masthead Bar */}
            <line x1="45" y1="28" x2="115" y2="28" stroke="currentColor" strokeWidth="3" strokeOpacity="0.9" />
            <line x1="45" y1="34" x2="115" y2="34" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Left Column Lines */}
            <line x1="45" y1="42" x2="72" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="45" y1="47" x2="72" y2="47" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="45" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Right Column Lines */}
            <line x1="88" y1="42" x2="115" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="88" y1="47" x2="115" y2="47" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="88" y1="52" x2="108" y2="52" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
          </svg>
        </div>
      )
  }
}
