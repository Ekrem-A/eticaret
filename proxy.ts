import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/utils/admin'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const adminEmailsRaw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS
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
  let resolvedUser = session?.user ?? null

  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      resolvedUser = user
    }
  }

  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isAuthRoute && resolvedUser) {
    const isAdmin = isAdminUser(resolvedUser, adminEmailsRaw)
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/', request.url))
  }

  if (pathname === '/' && resolvedUser) {
    const isAdmin = isAdminUser(resolvedUser, adminEmailsRaw)
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (resolvedUser && !isAdminUser(resolvedUser, adminEmailsRaw)) {
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