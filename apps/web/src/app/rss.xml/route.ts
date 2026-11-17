import { fetchArticles } from '@/lib/api'

export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theopenbrief.app'
  const articles = await fetchArticles()

  const itemsXml = articles
    .map((art) => {
      const pubDate = new Date(art.publishedDate).toUTCString()
      const link = `${baseUrl}/articles/${art.slug}`
      return `
    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(art.excerpt || art.title)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(art.authorName)}</author>
      <category>${escapeXml(art.section)}</category>
    </item>`
    })
    .join('')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Open Brief</title>
    <link>${baseUrl}</link>
    <description>An independent publication of explainers, technical breakdowns, movie reviews, and long-form essays.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
