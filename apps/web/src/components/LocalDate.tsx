'use client'

import { useEffect, useState } from 'react'

interface LocalDateProps {
  date?: string
  format?: 'masthead' | 'long' | 'short'
}

function formatWithOptions(d: Date, format: 'masthead' | 'long' | 'short', timeZone?: string) {
  const options: Intl.DateTimeFormatOptions =
    format === 'masthead'
      ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
      : format === 'long'
      ? { month: 'long', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }

  if (timeZone) {
    options.timeZone = timeZone
  }

  return new Intl.DateTimeFormat('en-US', options).format(d)
}

export default function LocalDate({ date, format = 'short' }: LocalDateProps) {
  const [text, setText] = useState<string>(() => {
    const d = date ? new Date(date) : new Date()
    if (isNaN(d.getTime())) return date || ''
    return formatWithOptions(d, format, 'Asia/Kolkata')
  })

  useEffect(() => {
    const d = date ? new Date(date) : new Date()
    if (isNaN(d.getTime())) return
    setText(formatWithOptions(d, format))
  }, [date, format])

  return <span suppressHydrationWarning>{text}</span>
}
