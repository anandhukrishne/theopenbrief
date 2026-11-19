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
            className="w-full h-full object-contain opacity-85 dark:opacity-75"
          />
        </div>
      )

    case 'journal':
      return (
        <div className={`pointer-events-none select-none z-0 ${className}`}>
          {/* Clean minimalist plus symbol */}
          <img
            src="/watermark-plus.svg"
            alt=""
            className="w-full h-full object-contain opacity-75 dark:opacity-65"
          />
        </div>
      )

    case 'tech':
      return (
        <div className={`pointer-events-none select-none z-0 text-neutral-800 dark:text-neutral-200 opacity-25 dark:opacity-20 ${className}`}>
          {/* Simple digital art circuit board traces */}
          <img
            src="/watermark-circuit.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )

    case 'cinebrief':
      return (
        <div className={`pointer-events-none select-none z-0 text-amber-900 dark:text-amber-200 opacity-25 dark:opacity-20 ${className}`}>
          {/* Simple digital art cinema theatre projector with light beam */}
          <img
            src="/watermark-projector.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )

    case 'general':
    default:
      return (
        <div className={`pointer-events-none select-none z-0 text-neutral-700 dark:text-neutral-300 opacity-25 dark:opacity-20 ${className}`}>
          {/* Simple digital art stacked broadsheet articles pile */}
          <img
            src="/watermark-articles.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )
  }
}
