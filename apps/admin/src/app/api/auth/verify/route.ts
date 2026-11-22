import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getOrCreateProfile } from '@/lib/db'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder-project.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const EXPIRES_IN_SEC = 60 * 60 * 24 * 5 // 5 days

export async function POST(req: Request) {
  try {
    const { email, code, token } = await req.json()
    const normalizedEmail = email?.trim().toLowerCase()
    const otpCode = String(code || token || '').trim()

    if (!normalizedEmail || !otpCode) {
      return NextResponse.json({ error: 'Email and OTP code are required.' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otpCode,
      type: 'email',
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Invalid or expired OTP code.' },
        { status: 401 }
      )
    }

    // OTP verified -> Look up staff profile in public.profiles & set 5-day openbrief_session cookie
    const user = data.user
    const profile = await getOrCreateProfile(
      user.id,
      normalizedEmail,
      user.user_metadata?.name || normalizedEmail.split('@')[0]
    )

    const response = NextResponse.json({
      status: 'success',
      message: 'Authenticated successfully',
      user: {
        uid: user.id,
        email: normalizedEmail,
        name: profile.name,
        role: profile.role,
      },
    })

    response.cookies.set('openbrief_session', data.session.access_token, {
      maxAge: EXPIRES_IN_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('Error in /api/auth/verify:', err)
    return NextResponse.json(
      { error: err?.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
