import { NextRequest, NextResponse } from 'next/server'
import { db, initDb, getOrCreateProfile } from '@/lib/db'
import { adminAuth } from '@/lib/firebaseAdmin'

// Helper to authenticate user from session cookie
async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('openbrief_session')?.value
  if (!token) return null
  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}

// GET /api/profile - Fetch current user's profile
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getOrCreateProfile(user.uid, user.email || '', user.name || '')
    return NextResponse.json({ profile })
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/profile - Update current user's own profile (name, bio, avatar_url)
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDb()
    const body = await req.json()
    const { name, bio, avatar_url } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const cleanName = name.trim()
    const cleanBio = (bio || '').trim()
    const cleanAvatar = (avatar_url || '').trim()

    const res = await db.query(
      `UPDATE profiles
       SET name = $1, bio = $2, avatar_url = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [cleanName, cleanBio, cleanAvatar, user.uid]
    )

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Cascade updates to articles authored by this user
    await db.query(
      `UPDATE articles
       SET author_name = $1, author_bio = $2, author_avatar_url = $3, updated_at = NOW()
       WHERE author_id = $4`,
      [cleanName, cleanBio, cleanAvatar, user.uid]
    )

    return NextResponse.json({ success: true, profile: res.rows[0] })
  } catch (err: any) {
    console.error('Error updating profile:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
