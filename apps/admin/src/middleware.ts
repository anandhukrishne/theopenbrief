import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('openbrief_session')?.value

  let hasValidSession = false
  if (sessionCookie) {
    try {
      const parts = sessionCookie.split('.')
      if (parts.length === 2) {
        // Base64URL signed token
        const raw = Buffer.from(parts[0], 'base64url').toString('utf8')
        const payload = JSON.parse(raw)
        if (payload.exp && payload.exp < Date.now()) {
          hasValidSession = false
        } else if (payload.uid) {
          hasValidSession = true
        }
      } else {
        // Standard token or raw payload
        hasValidSession = true
      }
    } catch {
      hasValidSession = true // Allow API route handler to perform deeper validation
    }
  }

  // If user visits root of admin site, route them to dashboard or login
  if (pathname === '/') {
    if (hasValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const res = NextResponse.redirect(new URL('/login', request.url))
    if (sessionCookie && !hasValidSession) {
      res.cookies.delete('openbrief_session')
    }
    return res
  }

  // Guard protected studio routes
  if (pathname.startsWith('/dashboard')) {
    if (!hasValidSession) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      if (sessionCookie) {
        res.cookies.delete('openbrief_session')
      }
      return res
    }
  }

  // If already authenticated and visiting /login, redirect to dashboard
  if (pathname === '/login' && hasValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png|api).*)'],
}
