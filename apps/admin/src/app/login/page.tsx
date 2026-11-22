'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CAROUSEL_SLIDES = [
  {
    image: '/carousel/slide-1.jpg',
    title: 'Really Simple Syndication',
    subtitle: 'High-speed, distraction-free feeds for readers',
  },
  {
    image: '/carousel/slide-2.png',
    title: 'Editorial Newspaper Edition',
    subtitle: 'Uncluttered broadsheet layout free from algorithmic noise',
  },
  {
    image: '/carousel/slide-3.png',
    title: 'Newsroom & Staff Access',
    subtitle: 'Role-based access control and contributor permissions',
  },
  {
    image: '/carousel/slide-4.png',
    title: 'Author Studio & Writing Desk',
    subtitle: 'Distraction-free Markdown authoring with instant preview',
  },
  {
    image: '/carousel/slide-5.png',
    title: 'Supabase PostgreSQL Archive',
    subtitle: 'High-performance dispatch indexing and real-time sync',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'password_otp' | 'email_otp'>('password_otp')
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
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

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          password: authMode === 'password_otp' ? password : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setStep('otp')
      setInfoMessage(data.devNotice || data.message || 'Verification code sent to your registered email.')
      if (data.code) {
        setDevCode(data.code)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const nextOtp = [...otp]
      digits.forEach((d, i) => {
        if (i < 6) nextOtp[i] = d
      })
      setOtp(nextOtp)
      const nextIndex = Math.min(digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const nextOtp = [...otp]
    nextOtp[index] = digit
    setOtp(nextOtp)

    if (digit && index < 5) {
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
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const digits = pasted.split('')
    const nextOtp = [...otp]
    digits.forEach((d, i) => {
      if (i < 6) nextOtp[i] = d
    })
    setOtp(nextOtp)
    const nextIndex = Math.min(digits.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = otp.join('').trim()
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code: fullCode }),
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
        body: JSON.stringify({
          action: 'send',
          email,
          password: authMode === 'password_otp' ? password : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setInfoMessage('A new verification code has been sent to your email.')
      if (data.code) {
        setDevCode(data.code)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to resend verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#F3F4F6] font-sans antialiased text-neutral-900">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-200/80 flex flex-col lg:flex-row min-h-[580px]">
        {/* Left/Top Column: Dark Demo Carousel (Desktop 55% left column, Mobile sleek top showcase) */}
        <div className="w-full lg:w-[55%] bg-[#18181B] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-neutral-800">
          {/* Top subtle brand status */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                The Open Brief Studio
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              {currentSlide + 1} / {CAROUSEL_SLIDES.length}
            </span>
          </div>

          {/* Carousel Showcase Area with Real Product Images */}
          <div className="my-auto py-2 sm:py-6">
            <div className="relative w-full aspect-[16/10] bg-[#121214] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden group">
              {CAROUSEL_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col ${
                    currentSlide === idx ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
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
                  <div className="p-3 sm:p-4 bg-[#18181B]/95 backdrop-blur-xs border-t border-neutral-800/80">
                    <p className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                      {slide.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              ))}

              {/* Prev / Next buttons on hover */}
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

          {/* Bottom Dot Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-neutral-600 hover:bg-neutral-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: White Authentication Panel (45%) */}
        <div className="w-full lg:w-[45%] bg-white relative overflow-hidden p-8 sm:p-12 flex flex-col justify-center">
          {/* Diagonal Admin Corner Ribbon */}
          <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-20">
            <div className="absolute top-5 -right-9 w-36 bg-[#FA5252] text-white text-[11px] font-bold py-1 text-center rotate-45 shadow-sm uppercase tracking-wider select-none">
              Admin
            </div>
          </div>

          {/* Feedback messages */}
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
                  const digits = devCode.split('')
                  setOtp(digits)
                  otpRefs.current[5]?.focus()
                }}
                className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 hover:underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Step 1: Credentials Form */}
          {step === 'credentials' && (
            <div className="space-y-6">
              <div className="text-center">
                {/* TOB Monogram Badge */}
                <div className="w-10 h-10 bg-black text-white font-black text-xs rounded-xl flex items-center justify-center mx-auto mb-4 tracking-tight shadow-sm select-none">
                  TOB
                </div>

                {/* Hello Again Heading */}
                <img
                  src="/hello-again.png"
                  alt="Hello again!"
                  className="h-10 sm:h-12 w-auto mx-auto mb-2 object-contain select-none"
                />
              </div>

              <div className="flex p-1 bg-neutral-100 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('password_otp'); setError(null); }}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                    authMode === 'password_otp'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Password + OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('email_otp'); setError(null); }}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                    authMode === 'email_otp'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Email + OTP
                </button>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="editor@theopenbrief.app"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                  />
                </div>

                {authMode === 'password_otp' ? (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Secret Key / Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                    We will send a secure 6-digit one-time verification code directly to your registered newsroom email.
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-[#0080FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-full transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loading
                      ? 'Sending OTP...'
                      : authMode === 'password_otp'
                      ? 'Get OTP'
                      : 'Send Login Code'}
                  </button>
                </div>

                {authMode === 'password_otp' && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email_otp')
                        setError(null)
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors inline-block"
                    >
                      Forgot password? Use Email + OTP instead
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === 'otp' && (
            <div className="space-y-5">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setError(null)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>

              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Mobile Verification
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter the 6 digit OTP you received in your email
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5 pt-2">
                {/* 6 Digit Inputs */}
                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-bold text-neutral-900 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-transparent transition-all"
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full py-3 px-6 bg-[#0080FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-full transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
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
