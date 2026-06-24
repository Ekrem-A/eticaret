import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/admin', '/profile', '/orders', '/checkout', '/cart']

function getUserRole(user: {
  user_metadata?: Record<string, unknown> | null
  app_metadata?: Record<string, unknown> | null
}) {
  const userRole = user.user_metadata?.role
  if (typeof userRole === 'string') {
    return userRole
  }

  const appRole = user.app_metadata?.role
  if (typeof appRole === 'string') {
    return appRole
  }

  return undefined
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          response = NextResponse.next({
            request,
          })

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/admin') && session) {
    const role = getUserRole(session.user)
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}