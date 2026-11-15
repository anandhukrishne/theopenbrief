import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication (admin panel)
const PROTECTED_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin paths (but not the login page itself)
  const isAdminPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isLoginPage = pathname === '/admin/login'

  if (isAdminPath && !isLoginPage) {
    // Payload sets the cookie as "openbrief-token"
    const token = request.cookies.get('openbrief-token')

    if (!token) {
      // No session cookie → redirect to Payload's login page
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next internals
    '/((?!_next/static|_next/image|favicon.ico|og-image.png).*)',
  ],
}
