import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body?.source === 'string' && body.source.trim() ? body.source.trim() : 'about_page'

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    await initDb()

    const existing = await db.query(
      'SELECT id, status FROM public.subscribers WHERE LOWER(email) = $1',
      [rawEmail]
    )

    if (existing.rows.length > 0 && existing.rows[0].status === 'active') {
      return NextResponse.json(
        {
          success: true,
          alreadySubscribed: true,
          message: 'You are already subscribed to our newsletter.',
        },
        { status: 200, headers: CORS_HEADERS }
      )
    }

    const result = await db.query(
      `INSERT INTO public.subscribers (email, status, source)
       VALUES ($1, 'active', $2)
       ON CONFLICT (email) DO UPDATE SET status = 'active', source = EXCLUDED.source
       RETURNING id, email, created_at`,
      [rawEmail, source]
    )

    return NextResponse.json(
      {
        success: true,
        alreadySubscribed: false,
        subscriber: result.rows[0],
        message: 'Subscribed! You will receive our weekly editorial digest.',
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (err: any) {
    console.error('Error in POST /api/subscribers:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to subscribe. Please try again.' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
