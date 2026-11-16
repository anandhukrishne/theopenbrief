import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

/**
 * Initializes Firebase Admin using project ID without requiring a restricted private key file.
 * Automatically verifies Google-issued ID tokens using Google's public JWK certificates.
 */
function getAdminAuth() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'theopenbrief'

  if (getApps().length === 0) {
    initializeApp({ projectId })
  }

  return getAuth()
}

export const adminAuth = getAdminAuth()
