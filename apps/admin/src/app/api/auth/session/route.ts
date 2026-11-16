import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebaseAdmin'

// 5 days duration for session cookie
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 })
    }

    // Create session cookie with Firebase Admin
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN })

    const res = NextResponse.json({ status: 'success' })

    // Store session id securely in HttpOnly cookie — never in site address or URL!
    res.cookies.set('openbrief_session', sessionCookie, {
      maxAge: EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return res
  } catch (err: any) {
    console.error('Session creation error:', err)
    return NextResponse.json({ error: err.message || 'Failed to authenticate session' }, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'logged_out' })
  res.cookies.set('openbrief_session', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  return res
}
