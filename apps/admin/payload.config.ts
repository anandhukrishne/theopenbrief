import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://admin.theopenbrief.app',
  secret: process.env.PAYLOAD_SECRET || 'a-fallback-secret-for-build-and-types-validation-32chars',
  
  // ─── Admin Panel ─────────────────────────────────────────────────────────
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— The Open Brief Admin',
      icons: [{ rel: 'icon', url: '/favicon.png' }],
      openGraph: {
        images: [{ url: '/logo.png' }],
      },
    },
  },

  // ─── Auth Cookie (HttpOnly, Secure, scoped to .theopenbrief.app) ─────────
  cookiePrefix: 'openbrief',
  
  // ─── Collections ─────────────────────────────────────────────────────────
  collections: [Users, Articles, Categories, Media, Pages],

  // ─── Rich Text Editor ────────────────────────────────────────────────────
  editor: lexicalEditor(),

  // ─── Database (Neon PostgreSQL) ───────────────────────────────────────────
  db: postgresAdapter({
    push: true, // Automatically synchronize schema on boot
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),

  // ─── TypeScript Output ────────────────────────────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  // ─── CORS (Allow reader frontend to query articles) ──────────────────────
  cors: [
    'https://theopenbrief.app',
    'https://www.theopenbrief.app',
    'https://admin.theopenbrief.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ],

  // ─── CSRF Protection ──────────────────────────────────────────────────────
  csrf: [
    'https://theopenbrief.app',
    'https://admin.theopenbrief.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
})
