import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware

export default withAuth(
    function middleware(req) {
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
                console.log('authorized', req, token)
                if (req.nextUrl.pathname === "/admin") {
                    return token?.userRole === "admin"
                }
                // `/me` only requires the user to be logged in
                return !!token ;
            },
        },
    })

export const config = { matcher: ["/", "/projects"] }