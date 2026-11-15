import type { CollectionConfig } from 'payload'

// Helper: check if user has one of the given roles
const hasRole = (user: any, roles: string[]) =>
  !!user && roles.includes(user.role)

// Helper: author can edit their own article, editors/admins can edit all
const isOwnerOrEditor = ({ req, doc }: any) => {
  const { user } = req
  if (!user) return false
  if (hasRole(user, ['editor', 'admin'])) return true
  // author can only edit if they wrote the article
  return doc?.author === user.id
}

export const Articles: CollectionConfig = {
  slug: 'articles',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'author', 'publishedDate'],
    // Preview live article on the frontend
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${data?.slug}?preview=true`,
    },
  },

  // ── Versioning & Drafts ───────────────────────────────────────────────────
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // autosave every 2 seconds
      },
    },
    maxPerDoc: 20,
  },

  // ── Access Control ────────────────────────────────────────────────────────
  access: {
    // Published articles are public; drafts only visible to logged-in staff
    read: ({ req }) => {
      if (hasRole(req.user, ['author', 'editor', 'admin'])) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => hasRole(req.user, ['author', 'editor', 'admin']),
    update: isOwnerOrEditor,
    delete: ({ req }) => hasRole(req.user, ['admin']),
    // Only editors and admins can publish (flip status to 'published')
    readVersions: ({ req }) => hasRole(req.user, ['editor', 'admin']),
  },

  fields: [
    // ── Core ─────────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'e.g. "the-rise-of-urban-libraries" → theopenbrief.app/articles/the-rise-of-urban-libraries',
        position: 'sidebar',
      },
      hooks: {
        // Auto-generate slug from title if not set
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },

    // ── Content Type ──────────────────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'journal',
      label: 'Content Type',
      options: [
        { label: '📔  Journal', value: 'journal' },
        { label: '📖  Short Story', value: 'short-story' },
        { label: '🌐  Web Explainer', value: 'explainer' },
        { label: '⚡  Tech Bite', value: 'tech-bite' },
      ],
      admin: { position: 'sidebar' },
    },

    // ── Status ────────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: '📝  Draft', value: 'draft' },
        { label: '👁️  In Review', value: 'review' },
        { label: '✅  Published', value: 'published' },
      ],
      // Only editors and admins can publish
      access: {
        update: ({ req }) => hasRole(req.user, ['editor', 'admin']),
      },
      admin: { position: 'sidebar' },
    },

    // ── Relationships ──────────────────────────────────────────────────────────
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Author',
      // Auto-assign current user as author
      hooks: {
        beforeChange: [
          ({ value, req, operation }) => {
            if (operation === 'create' && !value) return req.user?.id
            return value
          },
        ],
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Categories / Tags',
    },

    // ── Media ──────────────────────────────────────────────────────────────────
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },

    // ── Meta ──────────────────────────────────────────────────────────────────
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt / Summary',
      admin: {
        description: 'Short description shown in article cards and SEO meta description (160 chars max)',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Published Date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'isPremium',
      type: 'checkbox',
      label: '🔒 Premium (subscribers only)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readTime',
      type: 'number',
      label: 'Read Time (minutes)',
      admin: { position: 'sidebar', description: 'Auto or manually set' },
    },

    // ── Rich Text Body ──────────────────────────────────────────────────────────
    {
      name: 'content',
      type: 'richText',
      label: 'Article Body',
      required: true,
    },

    // ── SEO ───────────────────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Meta Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'OG Image' },
      ],
    },
  ],
}
