import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// Helper to verify caller is admin or editor
async function requireEditorOrAdmin(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return null

  await initDb()
  const res = await db.query('SELECT role FROM profiles WHERE id = $1', [user.uid])
  if (res.rows.length === 0) return null

  const role = res.rows[0].role
  if (role !== 'admin' && role !== 'editor') return null

  return { uid: user.uid, email: user.email, role }
}

// GET /api/staff — list all newsroom staff (admin/editor only)
export async function GET(req: NextRequest) {
  try {
    const caller = await requireEditorOrAdmin(req)
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const result = await db.query(
      `SELECT id, email, name, role, beat, password_plain, avatar_url, created_at, updated_at
       FROM profiles
       ORDER BY created_at ASC`
    )

    return NextResponse.json({ staff: result.rows, callerRole: caller.role, callerId: caller.uid })
  } catch (err: any) {
    console.error('Error fetching staff roster:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/staff — grant new staff access (admin/editor only)
export async function POST(req: NextRequest) {
  try {
    const caller = await requireEditorOrAdmin(req)
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const body = await req.json()
    const { name, email, password, role = 'writer', beat = '' } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const cleanName = String(name).trim()
    const cleanEmail = String(email).trim().toLowerCase()
    const cleanPassword = String(password).trim()
    const cleanRole = ['admin', 'editor', 'writer'].includes(role) ? role : 'writer'
    const cleanBeat = String(beat).trim()

    // Check if email already registered
    const existing = await db.query('SELECT id FROM profiles WHERE LOWER(email) = $1', [cleanEmail])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'A staff member with this email already exists' }, { status: 409 })
    }

    const newId = crypto.randomUUID()
    const insertRes = await db.query(
      `INSERT INTO profiles (id, email, name, role, beat, password_plain)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, beat, password_plain, created_at`,
      [newId, cleanEmail, cleanName, cleanRole, cleanBeat, cleanPassword]
    )

    return NextResponse.json({ success: true, member: insertRes.rows[0] })
  } catch (err: any) {
    console.error('Error creating staff credentials:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/staff — update a staff member's password, role, name, or beat (admin/editor only)
export async function PUT(req: NextRequest) {
  try {
    const caller = await requireEditorOrAdmin(req)
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const body = await req.json()
    const { id, password, role, name, beat } = body

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Build dynamic update
    const updates: string[] = ['updated_at = NOW()']
    const values: any[] = [id]
    let paramIndex = 2

    if (password !== undefined && String(password).trim().length > 0) {
      updates.push(`password_plain = $${paramIndex}`)
      values.push(String(password).trim())
      paramIndex++
    }

    if (role && ['admin', 'editor', 'writer'].includes(role)) {
      updates.push(`role = $${paramIndex}`)
      values.push(role)
      paramIndex++
    }

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(String(name).trim())
      paramIndex++
    }

    if (beat !== undefined) {
      updates.push(`beat = $${paramIndex}`)
      values.push(String(beat).trim())
      paramIndex++
    }

    const query = `
      UPDATE profiles
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, name, role, beat, password_plain, updated_at
    `

    const res = await db.query(query, values)
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, member: res.rows[0] })
  } catch (err: any) {
    console.error('Error updating staff access:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/staff?id=X — remove a staff member (admin/editor only)
export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireEditorOrAdmin(req)
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const targetId = searchParams.get('id')

    if (!targetId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Protect caller from deleting self
    if (targetId === caller.uid) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const res = await db.query('DELETE FROM profiles WHERE id = $1 RETURNING id, email, name', [targetId])
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: res.rows[0] })
  } catch (err: any) {
    console.error('Error deleting staff member:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
