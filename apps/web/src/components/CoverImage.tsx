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

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl',
  }

  // If no source or error loading image, render the clean TOB editorial monogram box
  if (!src || hasError || !src.trim()) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ${aspectRatio || ''}`}>
        <div className={`${sizeClasses[monogramSize]} bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center font-bold tracking-tight shadow-sm select-none`}>
          TOB
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
