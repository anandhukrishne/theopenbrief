import type { CollectionConfig } from 'payload'

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.theopenbrief.app'

export const Media: CollectionConfig = {
  slug: 'media',

  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
  },

  // Upload configuration with Cloudflare CDN URL generation
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'feature',
        width: 1200,
        height: 675,
        position: 'centre',
      },
    ],
  },

  // Rewrite URLs to point directly through your Cloudflare CDN (cdn.theopenbrief.app)
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc.filename) {
          doc.cdnUrl = `${CDN_BASE_URL}/media/${doc.filename}`
        }
        return doc
      },
    ],
  },

  access: {
    read: () => true, // Publicly accessible via CDN
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
