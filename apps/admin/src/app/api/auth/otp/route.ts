import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder-project.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // 1. Verify password against Supabase Auth (hashed in auth.users)
    const { error: pwError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password).trim(),
    })

    if (pwError) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please verify your newsroom credentials.' },
        { status: 401 }
      )
    }

    // Sign out that initial password-only session so access is blocked until OTP passes
    await supabase.auth.signOut()

    // 2. Password passed -> Send the 6-digit OTP email (never creates new users)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      return NextResponse.json(
        { error: `Failed to send OTP email: ${otpError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'sent',
      message: 'Password verified. 6-digit OTP sent to your email.',
    })
  } catch (err: any) {
    console.error('Error in /api/auth/otp:', err)
    return NextResponse.json(
      { error: err?.message || 'Authentication error' },
      { status: 500 }
    )
  }
}
