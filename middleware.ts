import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware

export default withAuth(
    function middleware(request) {
        // Add a new header x-current-path which passes the path to downstream components
        const headers = new Headers(request.headers);
        headers.set("x-current-path", request.nextUrl.pathname);
        return NextResponse.next({ headers });
        // if (  ) {
        // if (req.nextauth?.token && req.nextUrl.pathname.startsWith('/login')) {
        //     console.log('authorized login access', req.url)
        //     return NextResponse.redirect('/');
        // }
        // }
        // if ( req.nextUrl.pathname.startsWith('/premium') ) {
        //     if (req.nextauth.token.userRole !== 'Premium') {
        //     return NextResponse.redirect(new URL('/dashboard', req.url));
        //     }
        // }
    },
    {
        callbacks: {
            authorized({ req, token }) {
                // `/admin` requires admin role
                // console.log('authorized: ', req, token)
                if (req.nextUrl.pathname === "/login") {
                    return true
                }
                // `/me` only requires the user to be logged in
                // return true;
                return !!token;
            },
        },
    })

export const config = { matcher: ["/", "/:projects*", "/login", "/api/projects"] }