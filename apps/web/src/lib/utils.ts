/**
 * Utility functions for TheOpenBrief
 */

/**
 * Converts an author name into a URL-safe slug
 * e.g. "Anandhu Krishna" -> "anandhu-krishna"
 */
export function getAuthorSlug(authorName: string): string {
  if (!authorName) return 'author'
  return encodeURIComponent(
    authorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  )
}

/**
 * Formats a date string into readable publication date
 */
export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}
