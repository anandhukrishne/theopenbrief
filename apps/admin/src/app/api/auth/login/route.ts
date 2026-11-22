import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit'

const EXPIRES_IN_SEC = 60 * 60 * 24 * 5 // 5 days

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

    // Query profiles in Supabase database by email or name/handle
    const res = await db.query(
      `SELECT id, email, name, role, beat, password_plain
       FROM profiles
       WHERE LOWER(email) = $1 OR LOWER(name) = $1 OR LOWER(REPLACE(name, ' ', '')) = $1`,
      [cleanEmail]
    )

    if (res.rows.length === 0) {
      await recordFailedAttempt(cleanEmail)
      await recordFailedAttempt(`ip_${clientIp}`)
      return NextResponse.json({ error: 'Account not found in newsroom roster' }, { status: 404 })
    }

    const user = res.rows[0]

    // Verify password if set on profile
    if (user.password_plain && user.password_plain !== cleanPassword) {
      await recordFailedAttempt(cleanEmail)
      await recordFailedAttempt(`ip_${clientIp}`)
      return NextResponse.json({ error: 'Invalid password. Please check your credentials.' }, { status: 401 })
    }

    // Login successful: reset rate limits
    await resetRateLimit(cleanEmail)
    await resetRateLimit(`ip_${clientIp}`)

    // Create session token
    const sessionPayload = {
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ts: Date.now(),
    }

    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64')

    const response = NextResponse.json({
      status: 'success',
      user: { uid: user.id, email: user.email, name: user.name, role: user.role },
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
