import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  
  // ── Enable Payload's built-in auth ────────────────────────────────────────
  // This gives you: login, logout, forgot-password, reset-password, refresh-token
  // All tokens are stored in HttpOnly cookies — NEVER in the URL
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    // Lock account after 5 failed attempts for 10 minutes
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 10,
  },

  // ── Admin panel display ───────────────────────────────────────────────────
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    // Only admins can see the Users list in the admin panel
    hidden: ({ user }) => user?.role !== 'admin',
  },

  // ── Access Control ────────────────────────────────────────────────────────
  access: {
    // Anyone can create an account (or restrict to admin-only invite)
    create: ({ req }) => req.user?.role === 'admin',
    // Users can read their own profile; admins can read all
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    // Users can update their own profile; admins can update all
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    // Only admins can delete users
    delete: ({ req }) => req.user?.role === 'admin',
    // Only admins can unlock accounts
    unlock: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Short Bio',
      admin: {
        description: 'Displayed on author profile pages and article bylines',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
    },
    {
      name: 'twitter',
      type: 'text',
      label: 'Twitter / X handle',
      admin: { placeholder: '@handle' },
    },

    // ── Role ─────────────────────────────────────────────────────────────────
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      label: 'Role',
      options: [
        { label: '✍️  Author', value: 'author' },
        { label: '📝  Editor', value: 'editor' },
        { label: '⚙️  Admin', value: 'admin' },
      ],
      // Only admins can change roles
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
      admin: {
        description: 'Author: write own articles | Editor: publish all | Admin: full control',
      },
    },
  ],
}
