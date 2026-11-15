import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // If hitting admin subdomain (e.g. admin.theopenbrief.app)
  if (host.startsWith('admin.')) {
    // If visitor lands on root of admin subdomain, forward to /admin
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png|api).*)',
  ],
}
