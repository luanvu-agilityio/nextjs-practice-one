import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define your routes
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/about',
  '/contact',
  '/pricing',
];

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/account'];

export const runtime = 'nodejs';

export default async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  console.log(`[middleware] Processing: ${pathname}`);

  // Skip middleware for system routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    console.log(`[middleware] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    try {
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('[middleware] NEXTAUTH_SECRET not found');
        const url = new URL('/signin', origin);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
      }

      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        console.log(`[middleware] No token found, redirecting to signin`);
        const url = new URL('/signin', origin);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
      }

      console.log(`[middleware] Protected route authorized: ${pathname}`);
    } catch (error) {
      console.error('[middleware] Authentication error:', error);
      const url = new URL('/signin', origin);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
