import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Users } from './src/collections/Users'
import { Articles } from './src/collections/Articles'
import { Categories } from './src/collections/Categories'
import { Media } from './src/collections/Media'
import { Pages } from './src/collections/Pages'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // ─── App Identity & Secret ──────────────────────────────────────────────
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'a-fallback-secret-for-build-and-types-validation-32chars',
  
  // ─── Admin Panel ─────────────────────────────────────────────────────────
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— The Open Brief',
      icons: [{ rel: 'icon', url: '/favicon.png' }],
      openGraph: {
        images: [{ url: '/logo.png' }],
      },
    },
  },

  // ─── Auth Cookie (HttpOnly, Secure, never in URL) ────────────────────────
  cookiePrefix: 'openbrief',
  // Payload automatically sets:
  //   HttpOnly: true   → JS cannot steal it (XSS-safe)
  //   Secure: true     → HTTPS only
  //   SameSite: 'lax'  → CSRF protection
  //   Path: '/'
  
  // ─── Collections ─────────────────────────────────────────────────────────
  collections: [Users, Articles, Categories, Media, Pages],

  // ─── Rich Text Editor ────────────────────────────────────────────────────
  editor: lexicalEditor(),

  // ─── Database (Neon PostgreSQL) ───────────────────────────────────────────
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  // ─── Image Storage (Vercel Blob — 1-click free on Vercel) ────────────────
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  // ─── TypeScript Output ────────────────────────────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  // ─── CORS (allow frontend to call API) ────────────────────────────────────
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://admin.theopenbrief.app',
    'https://theopenbrief.app',
  ],

  // ─── CSRF protection ──────────────────────────────────────────────────────
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://admin.theopenbrief.app',
    'https://theopenbrief.app',
  ],
})
