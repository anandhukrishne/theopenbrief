import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebaseAdmin'

export interface AuthUser {
  uid: string
  email: string
  name?: string
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('openbrief_session')?.value
  if (!token) return null

  // 1. Try Firebase verifyIdToken
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    if (decoded?.uid) {
      return { uid: decoded.uid, email: decoded.email || '', name: decoded.name }
    }
  } catch {
    // Fall through
  }

  // 2. Try database session token
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(raw)
    if (parsed.uid && parsed.email) {
      return { uid: parsed.uid, email: parsed.email, name: parsed.name }
    }
  } catch {
    // Invalid
  }

  return null
}
