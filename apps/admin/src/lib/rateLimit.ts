import { db, initDb } from '@/lib/db'

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts?: number
  retryAfterSeconds?: number
  message?: string
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

/**
 * Ensures the rate limiting table exists
 */
async function ensureRateLimitTable() {
  await initDb()
  await db.query(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      identifier TEXT PRIMARY KEY,
      failed_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

/**
 * Checks if an identifier (IP address or email) is currently rate-limited
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    await ensureRateLimitTable()
    const cleanId = identifier.trim().toLowerCase()

    const res = await db.query(
      `SELECT failed_attempts, locked_until
       FROM auth_rate_limits
       WHERE identifier = $1`,
      [cleanId]
    )

    if (res.rows.length === 0) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
    }

    const row = res.rows[0]

    // If currently locked out
    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
      const retryAfterSeconds = Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1000)
      const minutes = Math.ceil(retryAfterSeconds / 60)
      return {
        allowed: false,
        retryAfterSeconds,
        message: `Too many failed attempts. For your security, this interface is locked for ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      }
    }

    // Lock expired, reset
    if (row.locked_until && new Date(row.locked_until).getTime() <= Date.now()) {
      await resetRateLimit(cleanId)
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - (row.failed_attempts || 0))
    return { allowed: true, remainingAttempts: remaining }
  } catch (err) {
    console.error('[RateLimit] Check error:', err)
    // Fail open in case of DB read error so legitimate users aren't locked out
    return { allowed: true }
  }
}

/**
 * Records a failed attempt for an identifier
 */
export async function recordFailedAttempt(identifier: string): Promise<void> {
  try {
    await ensureRateLimitTable()
    const cleanId = identifier.trim().toLowerCase()

    await db.query(
      `INSERT INTO auth_rate_limits (identifier, failed_attempts, last_attempt)
       VALUES ($1, 1, NOW())
       ON CONFLICT (identifier) DO UPDATE
       SET failed_attempts = auth_rate_limits.failed_attempts + 1,
           last_attempt = NOW(),
           locked_until = CASE
             WHEN auth_rate_limits.failed_attempts + 1 >= $2 THEN NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
             ELSE NULL
           END`,
      [cleanId, MAX_ATTEMPTS]
    )
  } catch (err) {
    console.error('[RateLimit] Record error:', err)
  }
}

/**
 * Resets failed attempts after a successful login
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    await ensureRateLimitTable()
    const cleanId = identifier.trim().toLowerCase()
    await db.query(`DELETE FROM auth_rate_limits WHERE identifier = $1`, [cleanId])
  } catch (err) {
    console.error('[RateLimit] Reset error:', err)
  }
}
