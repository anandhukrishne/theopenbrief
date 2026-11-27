'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CAROUSEL_SLIDES = [
  {
    image: '/carousel/slide-1.jpg',
    title: 'Really Simple Syndication',
  },
  {
    image: '/carousel/slide-2.png',
    title: 'Editorial Newspaper Edition',
  },
  {
    image: '/carousel/slide-3.png',
    title: 'Newsroom & Staff Access',
  },
  {
    image: '/carousel/slide-4.png',
    title: 'Author Studio & Writing Desk',
  },
  {
    image: '/carousel/slide-5.png',
    title: 'Supabase PostgreSQL Archive',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-advance carousel slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  // Auto-focus first input on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus()
    }
  }, [step])

  // Step 1: Verify Password & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setStep('otp')
      setInfoMessage(data.message || 'Password verified. OTP code sent to your email.')
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP digit changes (supports up to 8 digits & mobile autofill)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 8).split('')
      const nextOtp = ['', '', '', '', '', '', '', '']
      digits.forEach((d, i) => {
        if (i < 8) nextOtp[i] = d
      })
      setOtp(nextOtp)
      const nextIndex = Math.min(digits.length, 7)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const nextOtp = [...otp]
    nextOtp[index] = digit
    setOtp(nextOtp)

    if (digit && index < 7) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (!pasted) return
    const digits = pasted.split('')
    const nextOtp = ['', '', '', '', '', '', '', '']
    digits.forEach((d, i) => {
      if (i < 8) nextOtp[i] = d
    })
    setOtp(nextOtp)
    const nextIndex = Math.min(digits.length, 7)
    otpRefs.current[nextIndex]?.focus()
  }

  // Step 2: Verify OTP and Login (supports both 6 and 8 digit tokens)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = otp.join('').trim()
    if (fullCode.length < 6) {
      setError('Please enter your full verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setInfoMessage('A new verification code has been sent to your email.')
    } catch (err: any) {
      setError(err.message || 'Unable to resend verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3.5 sm:p-8 bg-[#F3F4F6] font-sans antialiased text-neutral-900">
      <div className="max-w-4xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-neutral-200/80 flex flex-col lg:flex-row lg:min-h-[580px]">
        {/* Mobile Compact Dark Studio Header (< lg) */}
        <div className="lg:hidden bg-[#18181B] px-5 py-3.5 flex items-center justify-between border-b border-neutral-800 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-300">
              TheOpenBrief Studio
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
            Staff Portal
          </span>
        </div>

        {/* Desktop Left Column: Dark Demo Carousel (55% on lg+) */}
        <div className="hidden lg:flex w-[55%] bg-[#18181B] p-10 flex-col justify-between relative overflow-hidden select-none border-r border-neutral-800">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                TheOpenBrief Studio
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              {currentSlide + 1} / {CAROUSEL_SLIDES.length}
            </span>
          </div>

          <div className="my-auto py-6">
            <div className="relative w-full aspect-[16/10] bg-[#121214] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden group">
              {CAROUSEL_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col ${currentSlide === idx ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}
                >
                  <div className="relative flex-1 w-full overflow-hidden bg-black/40">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-4 bg-[#18181B]/95 backdrop-blur-xs border-t border-neutral-800/80">
                    <p className="text-sm font-bold text-neutral-100 truncate">
                      {slide.title}
                    </p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
                aria-label="Previous slide"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all text-sm font-bold select-none cursor-pointer"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
                aria-label="Next slide"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all text-sm font-bold select-none cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-neutral-600 hover:bg-neutral-500'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: White Authentication Panel */}
        <div className="w-full lg:w-[45%] bg-white relative overflow-hidden p-5 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Diagonal Admin Corner Ribbon (Desktop only; mobile uses compact header badge) */}
          <div className="hidden lg:block absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-20">
            <div className="absolute top-5 -right-9 w-36 bg-[#FA5252] text-white text-[11px] font-bold py-1 text-center rotate-45 shadow-sm uppercase tracking-wider select-none">
              Admin
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-xl leading-relaxed">
              {infoMessage}
            </div>
          )}

          {devCode && (
            <div className="mb-4 p-2.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span>Dev OTP Code: <strong>{devCode}</strong></span>
              <button
                type="button"
                onClick={() => {
                  const padded = [...devCode.split(''), '', '', '', '', '', '', ''].slice(0, 8)
                  setOtp(padded)
                  otpRefs.current[Math.min(devCode.length - 1, 7)]?.focus()
                }}
                className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 hover:underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Step 1: Credentials Form */}
          {step === 'credentials' && (
            <div className="space-y-5 sm:space-y-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-black text-white font-black text-xs rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 tracking-tight shadow-sm select-none">
                  TOB
                </div>

                <img
                  src="/hello-again.png"
                  alt="Hello again!"
                  className="h-9 sm:h-12 w-auto mx-auto mb-1 object-contain select-none"
                />
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Registered Newsroom Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="editor@theopenbrief.app"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Newsroom Password / Key
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                  />
                </div>

                <div className="pt-1 sm:pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-[#0080FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-full transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {loading ? 'Verifying Password...' : 'Verify Password & Get OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === 'otp' && (
            <div className="space-y-4 sm:space-y-5">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setError(null)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Security Verification
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Enter the verification code sent to <span className="font-mono text-neutral-700">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5 pt-1">
                <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={idx === 0 ? 8 : 1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full h-11 sm:h-12 text-center text-base sm:text-xl font-bold text-neutral-900 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                    />
                  ))}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || otp.join('').trim().length < 6}
                    className="w-full py-3 px-6 bg-[#0080FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-full transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Studio'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-neutral-500">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="font-semibold text-[#0080FF] hover:underline transition-colors"
                    >
                      Send Again
                    </button>
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}