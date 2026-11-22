import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseServer'

export interface AuthUser {
  uid: string
  email: string
  name?: string
  role?: string
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('openbrief_session')?.value
  if (!token) return null

  // 1. Try Supabase Auth getUser token verification
  try {
    const supabase = getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user?.id) {
      return {
        uid: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        role: user.app_metadata?.role || user.user_metadata?.role,
      }
    }
  } catch {
    // Fall through to database session token
  }

  // 2. Try database session token (Base64 payload created on login)
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(raw)
    if (parsed.uid && parsed.email) {
      return {
        uid: parsed.uid,
        email: parsed.email,
        name: parsed.name,
        role: parsed.role,
      }
    }
  } catch {
    // Invalid token format
  }

  return null
}
