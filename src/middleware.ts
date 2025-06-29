import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // This should not happen if the environment variables are set up correctly.
    console.error('Missing Supabase URL or Anon Key')
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
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/signup', '/products'];
  const isPublicPath = pathname === '/' || publicRoutes.some(p => pathname.startsWith(p));

  const authRoutes = ['/login', '/signup'];
  const isAdminRoute = pathname.startsWith('/admin');

  // If the user is not logged in and is trying to access a protected route, redirect to login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If the user is logged in
  if (user) {
    // Fetch user role from the user_profiles table
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      await supabase.auth.signOut();
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('message', 'Could not find user profile.');
      return NextResponse.redirect(redirectUrl);
    }
    
    const userRole = profile.role;

    // If on an auth route (/login, /signup), redirect to the appropriate dashboard
    if (authRoutes.includes(pathname)) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/user/home', request.url));
    }
    
    // If a non-admin tries to access an admin route, redirect them
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/user/home', request.url));
    }
  }

  // Allow the request to continue
  return response;
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
