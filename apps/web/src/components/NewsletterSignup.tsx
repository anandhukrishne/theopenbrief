'use client'

import { useState } from 'react'

export type NewsletterVariant = 'about' | 'article' | 'home'

const VARIANT_COPY: Record<
  NewsletterVariant,
  { eyebrow: string; title: string; description: string; source: string }
> = {
  about: {
    eyebrow: 'Weekly Digest',
    title: 'Subscribe to our Newsletter',
    description:
      'We send weekly emails from our editorial desk covering every article released that week.',
    source: 'about_page',
  },
  article: {
    eyebrow: 'Subscribe to TheOpenBrief',
    title: 'Enjoyed this article?',
    description:
      'Get our weekly roundup of new essays, visual explainers, and reviews delivered straight to your inbox.',
    source: 'article_footer',
  },
  home: {
    eyebrow: 'Weekly Newsletter',
    title: 'Get TheOpenBrief in your inbox',
    description:
      'Every week, our editorial desk sends a curated digest of our latest explainers, technology, and cinema dispatches.',
    source: 'home_banner',
  },
}

interface NewsletterSignupProps {
  variant?: NewsletterVariant
  className?: string
}

export default function NewsletterSignup({ variant = 'about', className = '' }: NewsletterSignupProps) {
  const copy = VARIANT_COPY[variant]
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus('error')
      setFeedback('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: copy.source }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed.')
      }

      setStatus('success')
      setFeedback(data.message || 'Subscribed! You will receive our weekly editorial digest.')
      if (!data.alreadySubscribed) {
        setEmail('')
      }
    } catch (err: any) {
      setStatus('error')
      setFeedback(err?.message || 'Unable to subscribe right now. Please try again.')
    }
  }

  const isHome = variant === 'home'

  return (
    <section
      className={`border border-neutral-300 dark:border-neutral-800 bg-[#F9FAFB] dark:bg-[#0D1320] rounded-xs ${isHome ? 'my-12 p-6 sm:p-8' : 'mt-12 p-6 sm:p-7'
        } ${className}`}
    >
      <div className={isHome ? 'flex flex-col lg:flex-row lg:items-center justify-between gap-6' : 'space-y-4'}>
        <div className={isHome ? 'max-w-xl space-y-1.5' : 'space-y-1.5'}>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-red-600 dark:text-red-400 block">
            {copy.eyebrow}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {copy.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {copy.description}
          </p>
        </div>

        <div className={isHome ? 'w-full lg:w-auto lg:min-w-[400px]' : 'w-full'}>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') {
                  setStatus('idle')
                  setFeedback('')
                }
              }}
              placeholder="you@example.com"
              aria-label="Email address"
              disabled={status === 'loading'}
              className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-[#080C14] border border-neutral-300 dark:border-neutral-700 rounded-full text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-red-600 dark:focus:border-red-400 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors disabled:opacity-60 shrink-0 shadow-xs"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {feedback && (
            <p
              className={`mt-2.5 text-xs font-sans font-medium ${status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-400'
                }`}
            >
              {feedback}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
