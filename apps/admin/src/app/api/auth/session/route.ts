import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseServer'
import { getOrCreateProfile } from '@/lib/db'
import { createSessionToken } from '@/lib/auth'

// 30 days duration for persistent admin session cookie
const EXPIRES_IN_SEC = 60 * 60 * 24 * 30

export async function POST(req: NextRequest) {
  try {
    const { idToken, accessToken } = await req.json()
    const token = accessToken || idToken

    if (!token) {
      return NextResponse.json({ error: 'Missing authentication token' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user?.id) {
      return NextResponse.json({ error: 'Invalid or expired Supabase authentication token' }, { status: 401 })
    }

    const email = user.email || ''
    const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Staff Member'
    const profile = await getOrCreateProfile(user.id, email, name)

    const sessionToken = createSessionToken({
      uid: user.id,
      email,
      name: profile.name,
      role: profile.role,
    }, 30)

    const res = NextResponse.json({
      status: 'success',
      user: {
        uid: user.id,
        email,
        name: profile.name,
        role: profile.role,
      },
    })

    // Store verified 30-day session token as HttpOnly session cookie
    res.cookies.set('openbrief_session', sessionToken, {
      maxAge: EXPIRES_IN_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return res
  } catch (err: any) {
    console.error('Supabase session verification error:', err)
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'success', message: 'Logged out successfully' })
  res.cookies.delete('openbrief_session')
  return res
}

