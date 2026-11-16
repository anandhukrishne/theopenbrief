import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebaseAdmin'

// 5 days duration for session cookie
const EXPIRES_IN_SEC = 60 * 60 * 24 * 5

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 })
    }

    // Verify the Firebase ID token using Google's public certificates (Zero private key required)
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    if (!decodedToken.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const res = NextResponse.json({ status: 'success', user: { uid: decodedToken.uid, email: decodedToken.email } })

    // Store verified ID token directly as the HttpOnly session cookie
    res.cookies.set('openbrief_session', idToken, {
      maxAge: EXPIRES_IN_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return res
  } catch (err: any) {
    console.error('Session verification error:', err)
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 401 })
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
