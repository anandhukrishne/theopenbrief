'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed.')
      }

      setStatus('success')
      setFeedback(data.message || 'Subscribed! Welcome to The Open Brief.')
      if (!data.alreadySubscribed) {
        setEmail('')
      }
    } catch (err: any) {
      setStatus('error')
      setFeedback(err?.message || 'Unable to subscribe right now. Please try again.')
    }
  }

  return (
    <section className="mt-10 p-6 sm:p-7 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40">
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
        Subscribe to our Newsletter
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
        We send weekly emails on from editorial desk on articles released that week
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          aria-label="Email address"
          disabled={status === 'loading'}
          className="flex-1 px-3.5 py-2.5 text-sm bg-[#FCFCFD] dark:bg-[#080C14] border border-neutral-300 dark:border-neutral-700 rounded-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-300 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 text-xs font-sans font-bold uppercase tracking-wider bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xs hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors disabled:opacity-60 shrink-0"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {feedback && (
        <p
          className={`mt-3 text-xs font-sans font-medium ${
            status === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {feedback}
        </p>
      )}
    </section>
  )
}
