import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware"; // <-- Import the specific NextAuth type

export default withAuth(
  function proxy(req: NextRequestWithAuth) { // <-- Use NextRequestWithAuth here
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Force re-login if refresh token failed
    if (token?.error === "RefreshAccessTokenError") {
     return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Protect Admin Routes
    if (path.startsWith("/admin")) {
      if (token?.user?.role !== "ADMIN") {
        // Redirect non-admins to the standard dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        
        // Always allow public auth routes to load
        // This prevents the infinite redirect loop on the login page!
        if (
          path.startsWith("/login") || 
          path.startsWith("/register") || 
          path.startsWith("/verify-email") ||
          path.startsWith("/forgot-password") ||
          path.startsWith("/reset-password") ||
          path === "/"
        ) {
          return true; 
        }

        // For all other routes matched by the config below, require a token
        return !!token;
      },
    },
  }
);

// Apply proxy to protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*"],
};
