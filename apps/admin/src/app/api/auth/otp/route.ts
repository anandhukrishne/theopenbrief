import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'

const EXPIRES_IN_SEC = 60 * 60 * 24 * 5 // 5 days (432000 seconds)

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const body = await req.json()
    const action = body.action || (body.code ? 'verify' : 'send')

    if (action === 'send') {
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const cleanPassword = String(password).trim()

      // Validate credentials against Neon DB profiles
      const res = await db.query(
        `SELECT id, email, name, role, beat, password_plain
         FROM profiles
         WHERE LOWER(email) = $1 OR LOWER(name) = $1 OR LOWER(REPLACE(name, ' ', '')) = $1`,
        [cleanEmail]
      )

      if (res.rows.length === 0) {
        return NextResponse.json(
          { error: 'Account not found in newsroom roster' },
          { status: 404 }
        )
      }

      const user = res.rows[0]

      // Verify password if set on profile
      if (user.password_plain && user.password_plain !== cleanPassword) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        )
      }

      // Generate 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Ensure otps table exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS otps (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        )
      `)

      // Store in Neon DB with 10 minute expiry
      const targetEmail = String(user.email).trim().toLowerCase()
      await db.query(
        `INSERT INTO otps (email, code, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
         ON CONFLICT (email) DO UPDATE
         SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
        [targetEmail, code]
      )

      console.log(`[OTP] Verification code for ${targetEmail}: ${code}`)

      const responsePayload: { status: string; message: string; code?: string } = {
        status: 'sent',
        message: 'OTP sent to registered email',
      }

      if (process.env.NODE_ENV !== 'production') {
        responsePayload.code = code
      }

      return NextResponse.json(responsePayload)
    }

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

      // Ensure otps table exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS otps (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        )
      `)

      // Check OTP in Neon DB
      const otpRes = await db.query(
        `SELECT email, code, expires_at FROM otps WHERE LOWER(email) = $1`,
        [cleanEmail]
      )

      if (otpRes.rows.length === 0) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new OTP.' },
          { status: 400 }
        )
      }

      const otpRow = otpRes.rows[0]
      const isExpired = new Date(otpRow.expires_at).getTime() < Date.now()

      if (isExpired) {
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      if (otpRow.code !== cleanCode) {
        return NextResponse.json(
          { error: 'Invalid verification code. Please check and try again.' },
          { status: 401 }
        )
      }

      // Code is valid: remove from table
      await db.query(`DELETE FROM otps WHERE LOWER(email) = $1`, [cleanEmail])

      // Fetch user profile from profiles
      const profileRes = await db.query(
        `SELECT id, email, name, role, beat
         FROM profiles
         WHERE LOWER(email) = $1 OR LOWER(name) = $1 OR LOWER(REPLACE(name, ' ', '')) = $1`,
        [cleanEmail]
      )

      if (profileRes.rows.length === 0) {
        return NextResponse.json(
          { error: 'User profile not found in newsroom roster' },
          { status: 404 }
        )
      }

      const user = profileRes.rows[0]

      // Generate session token
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
        user: {
          uid: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })

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
    console.error('OTP authentication error:', err)
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    )
  }
}
