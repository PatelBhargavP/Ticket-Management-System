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
                
                // All API routes (except /api/mcp which is excluded from middleware via matcher)
                // require NextAuth session authentication, UNLESS it's an internal MCP server request.
                // Internal MCP requests are identified by the X-MCP-Internal header.
                // This ensures external access requires session, while MCP server can use API keys.
                if (req.nextUrl.pathname.startsWith("/api/")) {
                    // Check if this is an internal MCP server request
                    const isMCPInternal = req.headers.get('x-mcp-internal') === 'true';
                    if (isMCPInternal) {
                        // Allow internal MCP requests with Bearer token (validated in route handler)
                        return true;
                    }
                    // For external API requests, require NextAuth session
                    // Note: /api/mcp is excluded from this middleware via matcher config
                    return !!token;
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
         * - api/mcp (MCP server routes - uses API key authentication)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api/auth|api/mcp|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}
