import authConfig from "@/auth.config"
import NextAuth from "next-auth"

import{
    authRoutes,
    protectedRoutes,
    defaultRoute,
    publicRoutes,
    apiAuthPrefix,
    unauthorizedRoute
}
from "@/routes"
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const isApiRoute = pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    console.log("Route: ", pathname);
    console.log("isLoggedIn: ", isLoggedIn);
    // If the user is authenticated, allow them to access protected routes
    if (isLoggedIn && isProtectedRoute) {
        return NextResponse.next();
    }
    
    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!isLoggedIn && isProtectedRoute) {
        return NextResponse.redirect(new URL(`${unauthorizedRoute}`, req.url));
    }
    
    // If the user is authenticated and trying to access an auth route, redirect to default route
    if (isLoggedIn && isAuthRoute) {
        return NextResponse.redirect(new URL(`${defaultRoute}`, req.url));
    }
    
    // If the user is not authenticated and trying to access a public route, allow access
    if (!isLoggedIn && isPublicRoute) {
        return NextResponse.next();
    }

    // For all other cases, continue with the request
    return NextResponse.next();
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
      ],
}