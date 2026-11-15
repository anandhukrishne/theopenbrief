import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },

  versions: {
    drafts: true,
  },

  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => ['editor', 'admin'].includes(req.user?.role),
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'e.g. "about" → theopenbrief.app/about' },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
