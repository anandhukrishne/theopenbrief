import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseServer'
import { getOrCreateProfile, db, initDb } from '@/lib/db'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit'

const EXPIRES_IN_SEC = 60 * 60 * 24 * 5 // 5 days (432000 seconds)

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const body = await req.json()
    const action = body.action || (body.code ? 'verify' : 'send')
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // =========================================================================
    // STEP 1: Generate & Send OTP via Supabase Auth
    // =========================================================================
    if (action === 'send') {
      const { email } = body

      if (!email) {
        return NextResponse.json(
          { error: 'Registered email address is required' },
          { status: 400 }
        )
      }

      const cleanEmail = String(email).trim().toLowerCase()

      // Enforce rate limiting against brute force
      const emailLimit = await checkRateLimit(cleanEmail)
      if (!emailLimit.allowed) {
        return NextResponse.json(
          { error: emailLimit.message || 'Too many failed attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfterSeconds || 900) } }
        )
      }

      const ipLimit = await checkRateLimit(`ip_${clientIp}`)
      if (!ipLimit.allowed) {
        return NextResponse.json(
          { error: ipLimit.message || 'Too many failed attempts from this network. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds || 900) } }
        )
      }

      // 1. Call Supabase Auth to generate & send the OTP to user's email
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error('[Supabase Auth] signInWithOtp error:', error.message)
        await recordFailedAttempt(cleanEmail)
        await recordFailedAttempt(`ip_${clientIp}`)
        return NextResponse.json(
          { error: `Supabase Auth error: ${error.message}` },
          { status: 400 }
        )
      }

      // Reset login rate limits on successful dispatch
      await resetRateLimit(cleanEmail)
      await resetRateLimit(`ip_${clientIp}`)

      return NextResponse.json({
        status: 'sent',
        message: 'A 6-digit verification code has been generated and sent to your email by Supabase.',
      })
    }

    // =========================================================================
    // STEP 2: Verify Supabase OTP and Establish Session
    // =========================================================================
    if (action === 'verify') {
      const { email, code } = body

      if (!email || !code) {
        return NextResponse.json(
          { error: 'Email and verification code are required' },
          { status: 400 }
        )
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const cleanCode = String(code).trim()

      const supabase = getSupabaseAdmin()

      // 1. Verify the OTP token directly via Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      })

      if (error || !data.user) {
        console.error('[Supabase Auth] verifyOtp failed:', error?.message)
        await recordFailedAttempt(cleanEmail)
        await recordFailedAttempt(`ip_${clientIp}`)
        return NextResponse.json(
          { error: error?.message || 'Invalid or expired verification code.' },
          { status: 401 }
        )
      }

      // Verification succeeded: reset rate limits
      await resetRateLimit(cleanEmail)
      await resetRateLimit(`ip_${clientIp}`)

      const user = data.user
      const accessToken = data.session?.access_token

      // Retrieve or create newsroom profile in Supabase database
      const defaultName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        cleanEmail.split('@')[0] ||
        'Staff Writer'

      const profile = await getOrCreateProfile(user.id, cleanEmail, defaultName)

      // Fallback session token if Supabase session is stateless
      const sessionToken =
        accessToken ||
        Buffer.from(
          JSON.stringify({
            uid: user.id,
            email: cleanEmail,
            name: profile.name,
            role: profile.role,
            ts: Date.now(),
          })
        ).toString('base64')

      const response = NextResponse.json({
        status: 'success',
        user: {
          uid: user.id,
          email: cleanEmail,
          name: profile.name,
          role: profile.role,
        },
      })

      // Set 5-day secure HttpOnly session cookie
      response.cookies.set('openbrief_session', sessionToken, {
        maxAge: EXPIRES_IN_SEC,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: send, verify' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('Supabase OTP authentication error:', err)
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    )
  }
}
