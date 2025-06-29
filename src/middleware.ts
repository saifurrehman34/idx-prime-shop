import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // This `response` object will be passed to the Supabase client.
  // It will be mutated by the client to set and remove cookies.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in middleware.')
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The `set` method is called by the Supabase client to set a cookie.
          // We are modifying the `response` object returned by this middleware.
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // The `remove` method is called by the Supabase client to remove a cookie.
          // We are modifying the `response` object returned by this middleware.
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // This will refresh the session cookie and update it in the `response` object if it's about to expire.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  const isAdminRoute = pathname.startsWith('/admin')
  const isUserDashboardRoute = pathname.startsWith('/user')
  const isProtectedRoute = isAdminRoute || isUserDashboardRoute
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in
  if (user) {
    // If a logged-in user tries to access an auth route, redirect them away.
    if (isAuthRoute) {
        // We need to know their role to redirect them to the correct dashboard.
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/user/home', request.url))
    }
    
    // If a non-admin user tries to access an admin route, redirect them.
    if (isAdminRoute) {
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/user/home', request.url))
        }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
