import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
    // Add more paths that don't require authentication
    const publicPaths = ['/', '/auth/login', '/auth/register'];
    const path = request.nextUrl.pathname;

    // Get the token and check if it's still valid
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
    });

    // Allow access to public paths
    if (publicPaths.includes(path)) {
        return NextResponse.next();
    }

    // Redirect to login if no token and trying to access protected route
    if (!token && !path.startsWith('/auth/')) {
        const url = new URL('/auth/login', request.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
    }

    // Allow access if token exists
    if (token) {
        // Check for admin routes
        if (path.startsWith('/admin') && token.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 