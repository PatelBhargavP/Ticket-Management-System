import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (Middleware) for route protection and authentication
 * 
 * This proxy middleware:
 * - Protects routes requiring authentication
 * - Redirects authenticated users away from login page
 * - Adds x-current-path header for downstream components
 * 
 * Note: Next.js 16 uses "proxy" file convention instead of "middleware"
 * More on NextAuth.js middleware: https://next-auth.js.org/configuration/nextjs#middleware
 */

export default withAuth(
    function middleware(request: NextRequest & { nextauth?: { token?: any } }) {
        // Add a new header x-current-path which passes the path to downstream components
        const headers = new Headers(request.headers);
        headers.set("x-current-path", request.nextUrl.pathname);
        
        // Redirect authenticated users away from login page
        if (request.nextauth?.token && request.nextUrl.pathname.startsWith('/login')) {
            console.log('authorized login access', request.url)
            return NextResponse.redirect(new URL('/projects', request.url));
        }
        
        return NextResponse.next({ headers });
    },
    {
        callbacks: {
            authorized({ req, token }) {
                // Public routes that don't require authentication
                if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname.startsWith("/avatars")) {
                    return true;
                }
                
                // All other routes require authentication
                return !!token;
            },
        },
    }
)

/**
 * Next.js 16 proxy matcher configuration
 * 
 * Matches all routes except:
 * - api/auth/* (NextAuth.js authentication routes)
 * - _next/static/* (static files)
 * - _next/image/* (image optimization files)
 * - favicon.ico and other static assets
 * - Files with image extensions (served from public folder)
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth.js routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}
