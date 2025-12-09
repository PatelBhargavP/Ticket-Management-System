import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware

export default withAuth(
    function middleware(request) {
        // Add a new header x-current-path which passes the path to downstream components
        const headers = new Headers(request.headers);
        headers.set("x-current-path", request.nextUrl.pathname);
        if (request.nextauth?.token && request.nextUrl.pathname.startsWith('/login')) {
            console.log('authorized login access', request.url)
            return NextResponse.redirect(new URL('/projects', request.url));
        }
        return NextResponse.next({ headers });
    },
    {
        callbacks: {
            authorized({ req, token }) {
                // `/admin` requires admin role
                // console.log('authorized: ', req, token)
                return true
                if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname.startsWith("/avatars")) {
                    return true
                }
                // `/me` only requires the user to be logged in
                // return true;
                return !!token;
            },
        },
    })

export const config = { matcher: ["/", "/:projects*", "/login", "/api/projects"] }