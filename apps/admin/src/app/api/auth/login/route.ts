import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseServer'
import { getOrCreateProfile, initDb } from '@/lib/db'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit'
import { createSessionToken } from '@/lib/auth'

// 30 days duration for persistent admin session cookie
const EXPIRES_IN_SEC = 60 * 60 * 24 * 30

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanPassword = String(password).trim()
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // 1. Enforce rate limiting to prevent brute force attacks
    const emailLimit = await checkRateLimit(cleanEmail)
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: emailLimit.message || 'Too many failed login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfterSeconds || 900) } }
      )
    }

    const ipLimit = await checkRateLimit(`ip_${clientIp}`)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: ipLimit.message || 'Too many failed login attempts from this network. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds || 900) } }
      )
    }

    // 2. Verify credentials via Supabase Auth (passwords securely hashed in auth.users)
    const supabase = getSupabaseAdmin()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    })

    if (authError || !authData.user) {
      await recordFailedAttempt(cleanEmail)
      await recordFailedAttempt(`ip_${clientIp}`)
      return NextResponse.json(
        { error: 'Invalid email or password. Please verify your newsroom credentials.' },
        { status: 401 }
      )
    }

    // Login successful: reset rate limits
    await resetRateLimit(cleanEmail)
    await resetRateLimit(`ip_${clientIp}`)

    const user = authData.user

    // Fetch or create profile in public.profiles
    const profile = await getOrCreateProfile(
      user.id,
      cleanEmail,
      user.user_metadata?.name || cleanEmail.split('@')[0]
    )

    const sessionToken = createSessionToken({
      uid: user.id,
      email: cleanEmail,
      name: profile.name,
      role: profile.role,
    }, 30)

    const response = NextResponse.json({
      status: 'success',
      user: { uid: user.id, email: cleanEmail, name: profile.name, role: profile.role },
    })

    response.cookies.set('openbrief_session', sessionToken, {
      maxAge: EXPIRES_IN_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('Supabase login error:', err)
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 })
  }
}
