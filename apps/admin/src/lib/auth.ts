import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseServer'
import { getOrCreateProfile } from '@/lib/db'

export interface AuthUser {
  uid: string
  email: string
  name?: string
  role?: string
}

export interface SessionPayload {
  uid: string
  email: string
  name: string
  role: string
  exp: number
}

const SESSION_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'openbrief_staff_auth_secret_key_fixed'

/**
 * Creates a signed, tamper-proof session token valid for the specified number of days (default 30 days).
 */
export function createSessionToken(
  payload: { uid: string; email: string; name?: string; role?: string },
  maxAgeDays = 30
): string {
  const exp = Date.now() + maxAgeDays * 24 * 60 * 60 * 1000
  const data: SessionPayload = {
    uid: payload.uid,
    email: payload.email,
    name: payload.name || '',
    role: payload.role || 'writer',
    exp,
  }
  const jsonStr = JSON.stringify(data)
  const base64Data = Buffer.from(jsonStr).toString('base64url')
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(base64Data).digest('base64url')
  return `${base64Data}.${hmac}`
}

/**
 * Validates and decodes the session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length === 2) {
      const [base64Data, signature] = parts
      const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(base64Data).digest('base64url')
      if (signature !== expectedHmac) {
        return null
      }
      const raw = Buffer.from(base64Data, 'base64url').toString('utf8')
      const parsed: SessionPayload = JSON.parse(raw)
      if (parsed.exp && parsed.exp > Date.now() && parsed.uid && parsed.email) {
        return parsed
      }
      return null
    }

    // Fallback: legacy Base64 JSON token
    const raw = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(raw)
    if (parsed.uid && parsed.email) {
      if (parsed.exp && parsed.exp < Date.now()) return null
      return {
        uid: parsed.uid,
        email: parsed.email,
        name: parsed.name || '',
        role: parsed.role || 'writer',
        exp: parsed.exp || Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
    }
  } catch {
    return null
  }
  return null
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('openbrief_session')?.value
  if (!token) return null

  // 1. Prioritize verified 30-day session token
  const parsed = verifySessionToken(token)
  if (parsed) {
    try {
      const profile = await getOrCreateProfile(parsed.uid, parsed.email, parsed.name)
      return {
        uid: parsed.uid,
        email: parsed.email,
        name: profile.name || parsed.name,
        role: profile.role || parsed.role,
      }
    } catch {
      return {
        uid: parsed.uid,
        email: parsed.email,
        name: parsed.name,
        role: parsed.role,
      }
    }
  }

  // 2. Try Supabase Auth getUser token verification (for fresh Supabase JWTs)
  try {
    const supabase = getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user?.id) {
      const email = user.email || ''
      const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]
      const profile = await getOrCreateProfile(user.id, email, name)
      return {
        uid: user.id,
        email,
        name: profile.name || name,
        role: profile.role || user.app_metadata?.role || user.user_metadata?.role || 'writer',
      }
    }
  } catch {
    // Ignore error and return null
  }

  return null
}
