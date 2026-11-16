import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebaseAdmin'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify session cookie using Google's public certificates
    const token = req.cookies.get('openbrief_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 })
    }

    try {
      await adminAuth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 })
    }

    // 2. Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const slug = (formData.get('slug') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 })
    }

    const ghToken = process.env.GITHUB_CDN_TOKEN
    const repo = process.env.GITHUB_CDN_REPO || 'anandhukrishne/tob-cdn'

    if (!ghToken) {
      return NextResponse.json({ error: 'Server configuration missing GITHUB_CDN_TOKEN' }, { status: 500 })
    }

    // 3. Generate structured file path: articles/YYYY/MM/<slug>-<timestamp>.webp
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const timestamp = Date.now()
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const filePath = `articles/${year}/${month}/${cleanSlug}-${timestamp}.webp`

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentBase64 = buffer.toString('base64')

    // 4. Push directly to anandhukrishne/tob-cdn via GitHub Contents API
    const ghUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`
    const ghRes = await fetch(ghUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'TheOpenBrief-Admin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload media: ${filePath} via OpenBrief Studio`,
        content: contentBase64,
      }),
    })

    if (!ghRes.ok) {
      const errText = await ghRes.text()
      console.error('GitHub API CDN upload error:', errText)
      return NextResponse.json({ error: `GitHub API error: ${ghRes.statusText}` }, { status: ghRes.status })
    }

    // 5. Construct public CDN URL (cached by Cloudflare)
    const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.theopenbrief.app'
    const publicUrl = `${cdnBase}/${filePath}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    })
  } catch (err: any) {
    console.error('CDN upload endpoint error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
