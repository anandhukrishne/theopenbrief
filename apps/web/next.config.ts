import type { NextConfig } from 'next'

const securityHeaders = [
  // 1. Prevent MIME-sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 2. Control referrer information leakage
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 3. Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // 4. Force HTTPS (HSTS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // 5. Restrict sensitive browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // 6. Content-Security-Policy (CSP) to mitigate XSS
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https:;
      font-src 'self' data:;
      connect-src 'self' https://admin.theopenbrief.app https://*.supabase.co wss://*.supabase.co https://*.vercel-storage.com https://vitals.vercel-insights.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.theopenbrief.app',
      },
      {
        protocol: 'https',
        hostname: 'admin.theopenbrief.app',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
