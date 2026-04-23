import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. If a user is logged in but their session has a refresh error, 
    // force them back to login to re-authenticate.
    if (token?.error === "RefreshAccessTokenError") {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "SessionExpired");
      return NextResponse.redirect(url);
    }

    // 2. Email Verification Check
    // If the user is logged in but hasn't verified their email, force them to the verification page.
    if (token && token.user?.emailVerified === false) {
      // Prevent infinite redirect loops if they are already on the verify-email page
      if (!path.startsWith("/verify-email")) {
        return NextResponse.redirect(new URL("/verify-email", req.url));
      }
    }

    // 3. Protect Admin Routes: Only allow users with the 'ADMIN' role.
    if (path.startsWith("/admin")) {
      if (token?.user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        // Allow the dashboard and any of its sub-paths to be readable by everyone.
        // This satisfies your requirement for "non register user" access.
        if (path.startsWith("/dashboard")) {
          return true;
        }

        // For all other matched routes, require a valid token.
        return !!token;
      },
    },
  }
);

// Apply the middleware only to routes that need logic or protection.
// Added the missing protected routes (profile, bookmarks, notifications)
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/settings/:path*",
    "/profile/:path*",
    "/bookmarks/:path*",
    "/notifications/:path*"
  ],
};
