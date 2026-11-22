import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabaseServer'

// Helper to verify caller is admin or editor
async function requireEditorOrAdmin(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return null

  await initDb()
  const res = await db.query('SELECT role FROM public.profiles WHERE id = $1', [user.uid])
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
      `SELECT id, email, name, role, beat, avatar_url, created_at, updated_at
       FROM public.profiles
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

    // Check if email already registered in profiles
    const existing = await db.query('SELECT id FROM public.profiles WHERE LOWER(email) = $1', [cleanEmail])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'A staff member with this email already exists' }, { status: 409 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Create or update user in Supabase Auth (passwords securely hashed with bcrypt in auth.users)
    let authUserId = crypto.randomUUID()
    try {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: { name: cleanName, role: cleanRole },
      })

      if (authErr) {
        // If user already exists in auth.users, update their password
        if (authErr.message?.includes('already been registered') || authErr.message?.includes('exists')) {
          const { data: usersData } = await supabase.auth.admin.listUsers()
          const matchedUser = usersData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
          if (matchedUser) {
            authUserId = matchedUser.id
            await supabase.auth.admin.updateUserById(authUserId, {
              password: cleanPassword,
              user_metadata: { name: cleanName, role: cleanRole },
            })
          }
        } else {
          console.warn('[Supabase Auth] admin.createUser notice:', authErr.message)
        }
      } else if (authData?.user?.id) {
        authUserId = authData.user.id
      }
    } catch (e: any) {
      console.warn('[Supabase Auth] user creation note:', e?.message || e)
    }

    // 2. Insert into public.profiles (zero plaintext passwords)
    const insertRes = await db.query(
      `INSERT INTO public.profiles (id, email, name, role, beat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, beat = EXCLUDED.beat
       RETURNING id, email, name, role, beat, created_at`,
      [authUserId, cleanEmail, cleanName, cleanRole, cleanBeat]
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

    // 1. If password was provided, update it securely in Supabase Auth (auth.users)
    if (password && String(password).trim().length > 0) {
      try {
        const supabase = getSupabaseAdmin()
        await supabase.auth.admin.updateUserById(id, {
          password: String(password).trim(),
        })
      } catch (e: any) {
        console.warn('[Supabase Auth] password update notice:', e?.message)
      }
    }

    // 2. Build dynamic update for public.profiles
    const updates: string[] = ['updated_at = NOW()']
    const values: any[] = [id]
    let paramIndex = 2

    if (role && ['admin', 'editor', 'writer'].includes(role)) {
      updates.push(`role = $${paramIndex}`)
      values.push(role)
      paramIndex++
    }

    if (name && typeof name === 'string' && name.trim()) {
      updates.push(`name = $${paramIndex}`)
      values.push(name.trim())
      paramIndex++
    }

    if (beat !== undefined) {
      updates.push(`beat = $${paramIndex}`)
      values.push(String(beat).trim())
      paramIndex++
    }

    const updateQuery = `
      UPDATE public.profiles
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, name, role, beat, updated_at;
    `

    const result = await db.query(updateQuery, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, member: result.rows[0] })
  } catch (err: any) {
    console.error('Error updating staff member:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/staff — revoke staff access (admin/editor only)
export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireEditorOrAdmin(req)
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden: Admin or Editor privilege required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    if (id === caller.uid) {
      return NextResponse.json({ error: 'You cannot revoke your own access' }, { status: 400 })
    }

    // 1. Delete from Supabase Auth
    try {
      const supabase = getSupabaseAdmin()
      await supabase.auth.admin.deleteUser(id)
    } catch (e: any) {
      console.warn('[Supabase Auth] deleteUser notice:', e?.message)
    }

    // 2. Delete from public.profiles
    const res = await db.query('DELETE FROM public.profiles WHERE id = $1 RETURNING id, name', [id])

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Access revoked for ${res.rows[0].name}` })
  } catch (err: any) {
    console.error('Error revoking staff access:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
