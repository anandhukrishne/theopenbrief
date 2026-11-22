import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit'

const EXPIRES_IN_SEC = 60 * 60 * 24 * 5 // 5 days (432000 seconds)

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const body = await req.json()
    const action = body.action || (body.code ? 'verify' : 'send')
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (action === 'send') {
      const { email, password } = body

      if (!email) {
        return NextResponse.json(
          { error: 'Registered email address is required' },
          { status: 400 }
        )
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const cleanPassword = password ? String(password).trim() : null

      // 1. Enforce rate limiting against brute-force attacks
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

      // Validate credentials against Supabase DB profiles
      const res = await db.query(
        `SELECT id, email, name, role, beat, password_plain
         FROM profiles
         WHERE LOWER(email) = $1 OR LOWER(name) = $1 OR LOWER(REPLACE(name, ' ', '')) = $1`,
        [cleanEmail]
      )

      let user = res.rows[0]

      // If database has no profiles yet, allow registering the initial admin user
      if (!user) {
        const countRes = await db.query('SELECT COUNT(*) FROM profiles')
        const isFirstUser = parseInt(countRes.rows[0].count, 10) === 0
        if (isFirstUser) {
          const insertRes = await db.query(
            `INSERT INTO profiles (id, email, name, role, password_plain)
             VALUES (gen_random_uuid()::text, $1, $2, 'admin', $3)
             RETURNING *`,
            [cleanEmail, cleanEmail.split('@')[0], cleanPassword || '']
          )
          user = insertRes.rows[0]
        } else {
          await recordFailedAttempt(cleanEmail)
          await recordFailedAttempt(`ip_${clientIp}`)
          return NextResponse.json(
            { error: 'Account not found in newsroom roster' },
            { status: 404 }
          )
        }
      }

      // If password was provided (Password + OTP mode), verify password
      if (cleanPassword !== null) {
        if (user.password_plain && user.password_plain !== cleanPassword) {
          await recordFailedAttempt(cleanEmail)
          await recordFailedAttempt(`ip_${clientIp}`)
          return NextResponse.json(
            { error: 'Invalid password. Please check your credentials.' },
            { status: 401 }
          )
        }
      }

      // Reset login credential rate limits on valid password/request
      await resetRateLimit(cleanEmail)
      await resetRateLimit(`ip_${clientIp}`)

      // Generate 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Ensure otps table exists with attempts tracking
      await db.query(`
        CREATE TABLE IF NOT EXISTS otps (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          attempts INT NOT NULL DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL
        );
        ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
      `)

      // Store in Supabase DB with 10 minute expiry and reset attempts to 0
      const targetEmail = String(user.email).trim().toLowerCase()
      await db.query(
        `INSERT INTO otps (email, code, attempts, expires_at)
         VALUES ($1, $2, 0, NOW() + INTERVAL '10 minutes')
         ON CONFLICT (email) DO UPDATE
         SET code = EXCLUDED.code, attempts = 0, expires_at = EXCLUDED.expires_at`,
        [targetEmail, code]
      )

      console.log(`[OTP] Verification code for ${targetEmail}: ${code}`)

      let emailSent = false
      let emailErrorMessage: string | null = null

      // If Resend API key is configured, send real email via Resend API
      if (process.env.RESEND_API_KEY) {
        try {
          // Use verified custom domain if set via EMAIL_FROM, otherwise default to Resend's free sandbox sender
          const resendFrom = process.env.EMAIL_FROM || 'The Open Brief <onboarding@resend.dev>'
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: resendFrom,
              to: [targetEmail],
              subject: `Your Author Studio Verification Code: ${code}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px;">
                  <div style="margin-bottom: 24px; text-align: center;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #18181b; margin: 0;">The Open Brief</h2>
                    <p style="font-size: 12px; font-family: monospace; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Author Studio</p>
                  </div>
                  <p style="font-size: 14px; color: #3f3f46; line-height: 1.5; margin-bottom: 20px;">Use the following 6-digit verification code to complete your login:</p>
                  <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 20px; background: #f4f4f5; text-align: center; border-radius: 10px; color: #09090b; font-family: monospace;">
                    ${code}
                  </div>
                  <p style="color: #71717a; font-size: 12px; margin-top: 24px; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore.</p>
                </div>
              `,
            }),
          })

          const resendData = await resendRes.json()
          if (resendRes.ok) {
            emailSent = true
            console.log(`[OTP] Email sent successfully via Resend to ${targetEmail}, message id:`, resendData.id)
          } else {
            console.error('[OTP] Resend API error response:', resendData)
            emailErrorMessage = resendData.message || 'Resend domain unverified'
          }
        } catch (mailErr: any) {
          console.error('[OTP] Failed to send email via Resend:', mailErr)
          emailErrorMessage = mailErr.message
        }
      }

      const responsePayload: { status: string; message: string; code?: string; devNotice?: string } = {
        status: 'sent',
        message: emailSent
          ? 'Verification code sent to your registered email.'
          : 'Verification code generated.',
      }

      // If email was not successfully sent (or in development/unverified domain),
      // ALWAYS provide the code so newsroom staff is NEVER locked out!
      if (!emailSent || process.env.NODE_ENV !== 'production') {
        responsePayload.code = code
        if (emailErrorMessage) {
          responsePayload.devNotice = `Email notice: ${emailErrorMessage} (Fallback code active)`
        }
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
          attempts INT NOT NULL DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL
        );
        ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
      `)

      // Check OTP in Supabase DB
      const otpRes = await db.query(
        `SELECT email, code, attempts, expires_at FROM otps WHERE LOWER(email) = $1`,
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
        await db.query(`DELETE FROM otps WHERE LOWER(email) = $1`, [cleanEmail])
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      if (otpRow.code !== cleanCode) {
        const nextAttempts = (Number(otpRow.attempts) || 0) + 1

        if (nextAttempts >= 5) {
          // Invalidate OTP immediately upon 5 failed attempts to prevent brute force
          await db.query(`DELETE FROM otps WHERE LOWER(email) = $1`, [cleanEmail])
          await recordFailedAttempt(cleanEmail)
          await recordFailedAttempt(`ip_${clientIp}`)
          return NextResponse.json(
            { error: 'Too many incorrect attempts. For security, this verification code has been revoked. Please request a new OTP.' },
            { status: 429 }
          )
        }

        // Increment attempt counter
        await db.query(
          `UPDATE otps SET attempts = $1 WHERE LOWER(email) = $2`,
          [nextAttempts, cleanEmail]
        )

        const remaining = 5 - nextAttempts
        return NextResponse.json(
          { error: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before code is revoked.` },
          { status: 401 }
        )
      }

      // Code is valid: remove from table and reset any rate limit counters
      await db.query(`DELETE FROM otps WHERE LOWER(email) = $1`, [cleanEmail])
      await resetRateLimit(cleanEmail)
      await resetRateLimit(`ip_${clientIp}`)

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
