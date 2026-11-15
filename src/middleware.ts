import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Determine if request is hitting admin.theopenbrief.app (or local admin alias)
  const isAdminSubdomain = host.startsWith('admin.')

  if (isAdminSubdomain) {
    // If accessing root of admin subdomain, redirect or rewrite to /admin
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Protected paths check on admin subdomain
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/')
    if (pathname.startsWith('/admin') && !isLoginPage) {
      const token = request.cookies.get('openbrief-token')
      if (!token) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  } else {
    // On the main domain (theopenbrief.app):
    // Optionally redirect direct /admin visitors to admin.theopenbrief.app in production
    if (pathname.startsWith('/admin') && process.env.NODE_ENV === 'production') {
      const adminUrl = new URL(pathname, `https://admin.theopenbrief.app`)
      return NextResponse.redirect(adminUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png).*)',
  ],
}
