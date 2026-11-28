'use client'

import { useState } from 'react'

interface CoverImageProps {
  src?: string | null
  alt?: string
  className?: string
  aspectRatio?: string
  monogramSize?: 'sm' | 'md' | 'lg'
}

export default function CoverImage({
  src,
  alt = '',
  className = 'w-full h-full object-cover',
  aspectRatio,
  monogramSize = 'md',
}: CoverImageProps) {
  const [hasError, setHasError] = useState(false)

  const boxSizes = {
    sm: 'w-9 h-9 p-1.5',
    md: 'w-14 h-14 p-2',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 p-3',
  }

  // If no source or error loading image, render the official TOB mark inside the editorial monogram box
  if (!src || hasError || !src.trim()) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ${aspectRatio || ''}`}>
        <div className={`${boxSizes[monogramSize]} bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center shadow-sm select-none`}>
          <img
            src="/tob-mark-white.png"
            alt="TOB"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  )
}
