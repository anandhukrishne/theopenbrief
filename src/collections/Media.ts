import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',

  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
  },

  // Cloudinary handles actual storage (configured in payload.config.ts)
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
  },

  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Required for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photo Credit',
      admin: { placeholder: 'e.g. © Anand Kumar / The Open Brief' },
    },
  ],
}
