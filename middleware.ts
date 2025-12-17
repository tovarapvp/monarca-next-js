import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Handle admin routes separately
  if (pathname.includes('/admin')) {
    // Extract the locale and the rest of the path
    const pathParts = pathname.split('/').filter(Boolean);
    const locale = pathParts[0];
    const isLocale = routing.locales.includes(locale as any);

    // Determine the actual admin path
    const adminPath = isLocale ? `/${pathParts.slice(1).join('/')}` : pathname;

    // Allow access to the login page
    if (adminPath === '/admin/login') {
      return intlMiddleware(request);
    }

    // Check for admin authentication
    const adminAuth = request.cookies.get('monarca_admin')?.value;

    // If not authenticated, redirect to login
    if (!adminAuth || adminAuth !== 'true') {
      const loginUrl = new URL(isLocale ? `/${locale}/admin/login` : '/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply intl middleware for all routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next internal routes
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
