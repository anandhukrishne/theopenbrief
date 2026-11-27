import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

const WEB_APP_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = process.env.REVALIDATION_SECRET
  if (!secret) {
    return NextResponse.json(
      {
        error:
          'REVALIDATION_SECRET is not configured in Admin environment variables. Add the same REVALIDATION_SECRET to both apps/admin and apps/web.',
      },
      { status: 500 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const res = await fetch(`${WEB_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Web revalidation endpoint returned an error' },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to reach theopenbrief.app revalidation endpoint' },
      { status: 500 }
    )
  }
}
