import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a Supabase client and refresh the session
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const publicRoutes = ['/login', '/signup', '/products'];
  // The root path '/' and any path starting with /products are public
  const isPublicPath = pathname === '/' || publicRoutes.some(p => pathname.startsWith(p));

  const authRoutes = ['/login', '/signup'];
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/user');

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

    // If there's an error fetching the profile or no profile exists, sign out and redirect
    if (error || !profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?message=Could not find user profile.', request.url));
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
  return NextResponse.next();
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
