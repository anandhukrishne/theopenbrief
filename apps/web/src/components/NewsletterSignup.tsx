'use client'

import { useState, type CSSProperties } from 'react'

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
    eyebrow: 'The Open Brief Dispatch',
    title: 'Enjoyed this dispatch?',
    description:
      'Get our weekly roundup of new essays, visual explainers, and reviews delivered straight to your inbox.',
    source: 'article_footer',
  },
  home: {
    eyebrow: 'Weekly Editorial Briefing',
    title: 'Get The Open Brief in your inbox',
    description:
      'Every week, our editorial desk sends a curated digest of our latest explainers, technology, and cinema dispatches.',
    source: 'home_banner',
  },
}

const CONFETTI_PIECES = [
  { tx: '-54px', ty: '-42px', rot: '-140deg', color: 'bg-red-600', size: 'w-2 h-1.5 rounded-xs' },
  { tx: '-34px', ty: '-58px', rot: '110deg', color: 'bg-amber-400', size: 'w-1.5 h-1.5 rounded-full' },
  { tx: '-14px', ty: '-62px', rot: '-90deg', color: 'bg-emerald-500', size: 'w-2 h-1 rounded-xs' },
  { tx: '12px', ty: '-64px', rot: '130deg', color: 'bg-sky-500', size: 'w-1.5 h-1.5 rounded-full' },
  { tx: '34px', ty: '-56px', rot: '175deg', color: 'bg-red-500', size: 'w-2 h-1 rounded-xs' },
  { tx: '54px', ty: '-40px', rot: '-160deg', color: 'bg-amber-500', size: 'w-1.5 h-1.5 rounded-full' },
  { tx: '-62px', ty: '-12px', rot: '95deg', color: 'bg-sky-400', size: 'w-1.5 h-1 rounded-xs' },
  { tx: '62px', ty: '-10px', rot: '-115deg', color: 'bg-emerald-400', size: 'w-2 h-1.5 rounded-xs' },
  { tx: '-46px', ty: '28px', rot: '145deg', color: 'bg-amber-400', size: 'w-1.5 h-1.5 rounded-full' },
  { tx: '-18px', ty: '42px', rot: '-120deg', color: 'bg-red-600', size: 'w-2 h-1 rounded-xs' },
  { tx: '22px', ty: '40px', rot: '160deg', color: 'bg-emerald-500', size: 'w-1.5 h-1.5 rounded-full' },
  { tx: '48px', ty: '26px', rot: '-95deg', color: 'bg-sky-500', size: 'w-2 h-1 rounded-xs' },
]

interface NewsletterSignupProps {
  variant?: NewsletterVariant
  className?: string
}

export default function NewsletterSignup({ variant = 'about', className = '' }: NewsletterSignupProps) {
  const copy = VARIANT_COPY[variant]
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')
  const [confettiKey, setConfettiKey] = useState(0)

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
      setConfettiKey((k) => k + 1)
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
      className={`relative overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-[#F9FAFB] dark:bg-[#0D1320] rounded-xs ${isHome ? 'my-12 p-6 sm:p-8' : 'mt-12 p-6 sm:p-7'
        } ${className}`}
    >
      {/* Subtle Envelope & Dispatch Sheet Watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute -right-4 -bottom-4 w-44 sm:w-52 -rotate-6 text-neutral-900 dark:text-neutral-100 opacity-[0.045] dark:opacity-[0.06] pointer-events-none select-none"
      >
        {/* Dispatch sheet emerging from envelope */}
        <path d="M52 54V22a6 6 0 0 1 6-6h84a6 6 0 0 1 6 6v32" />
        <line x1="72" y1="34" x2="128" y2="34" />
        <line x1="72" y1="48" x2="112" y2="48" />
        {/* Envelope body */}
        <rect x="24" y="54" width="152" height="92" rx="8" />
        <path d="M26 58l74 52 74-52" />
        <path d="M26 142l48-38" />
        <path d="M174 142l-48-38" />
      </svg>

      <div className={`relative z-10 ${isHome ? 'flex flex-col lg:flex-row lg:items-center justify-between gap-6' : 'space-y-4'}`}>
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
            <div className="relative inline-flex shrink-0">
              {confettiKey > 0 && (
                <div
                  key={confettiKey}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-20"
                >
                  {CONFETTI_PIECES.map((piece, idx) => (
                    <span
                      key={idx}
                      style={
                        {
                          '--tx': piece.tx,
                          '--ty': piece.ty,
                          '--rot': piece.rot,
                        } as CSSProperties
                      }
                      className={`absolute ${piece.size} ${piece.color} animate-tob-confetti`}
                    />
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white active:scale-95 transition-all disabled:opacity-60 shadow-xs"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>

          {feedback && (
            <p
              className={`mt-2.5 text-xs font-sans font-medium ${
                status === 'error'
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
