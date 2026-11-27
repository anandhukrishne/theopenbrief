import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = (process.env.NEXT_PUBLIC_CMS_URL || 'https://admin.theopenbrief.app').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body?.source === 'string' && body.source.trim() ? body.source.trim() : 'about_page'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const res = await fetch(`${CMS_URL}/api/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('Newsletter subscription proxy error:', err)
    return NextResponse.json(
      { error: 'Unable to process subscription right now. Please try again.' },
      { status: 500 }
    )
  }
}
