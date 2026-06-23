import { NextResponse, type NextRequest } from 'next/server'

// Protected routes
const protectedRoutes = ['/admin', '/profile', '/orders', '/checkout', '/cart']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Get the auth cookie if exists
  const hasAuthCookie = request.cookies.has('sb-auth-token')

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (hasAuthCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
