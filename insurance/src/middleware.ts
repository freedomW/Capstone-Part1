import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import {
  authRoutes,
  defaultRoute,
  publicRoutes,
  unauthorizedRoute,
  apiAuthPrefix,
  adminRoutes, // Import adminRoutes for role-based access control
  dashboardRoutes, // Import dashboardRoutes for agent/supervisor/admin access
  protectedRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  console.log("Route: ", pathname);
  console.log("isLoggedIn: ", isLoggedIn);

  // Special case for NextAuth API routes - allow unauthenticated access
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith(apiAuthPrefix); // Use the prefix
  // Change to exact match for public routes
  const isPublic = publicRoutes.includes(pathname);
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));
  // Get the role directly from user object now that we've fixed the type declarations
  const userRole = req.auth?.user?.role;
  console.log("User role from middleware:", userRole);
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // 1. Handle API routes
  if (isApiRoute) {
    if (isLoggedIn) {
      return NextResponse.next(); // Allow logged-in users
    }
    // Return a JSON response for unauthenticated API requests
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Handle Authentication routes
  if (isAuth) {
    if (isLoggedIn) {
      // Redirect logged-in users away from auth pages
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
    return NextResponse.next(); // Allow unauthenticated users
  }  // 3. Handle Public routes
  if (isPublic) {
    return NextResponse.next(); // Allow everyone
  }  
    if (isAdminRoute) {
    console.log("User role from middleware:", userRole);
    
    // Check if user has admin permissions
    if (isLoggedIn && (userRole === 'ADMIN' || userRole === 'SUPERVISOR')) {
      console.log("Access granted to admin route - Role found in middleware");
      return NextResponse.next();
    }    
    // For API routes, return 403 Forbidden
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    
    // For UI routes, redirect to unauthorized page
    return NextResponse.redirect(new URL(unauthorizedRoute, req.url));
  }
  
  // 4. Handle Dashboard routes (only for agents, supervisors, admins)
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));
  if (isDashboardRoute) {
    if (isLoggedIn) {
      // Allow access only to agents, supervisors, and admins
      if (userRole === 'AGENT' || userRole === 'SUPERVISOR' || userRole === 'ADMIN') {
        return NextResponse.next();
      } else {
        // Redirect regular users to the user landing page
        return NextResponse.redirect(new URL('/user-landing', req.url));
      }
    }
    // If not logged in, redirect to login page
    return NextResponse.redirect(new URL(unauthorizedRoute, req.url));
  }

  // 5. Handle ALL other routes (implicitly protected)
  if (!isLoggedIn) {
    // If not logged in and route wasn't API, auth, or public, redirect.
    return NextResponse.redirect(new URL(unauthorizedRoute, req.url));
  }

  // If logged in and route wasn't handled above, allow access.
  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes (though specific API routes are handled by isProtected check now)
    '/(api|trpc)(.*)',
  ],
};