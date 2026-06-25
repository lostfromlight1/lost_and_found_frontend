import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isDashboardRoute = path.startsWith("/dashboard");
    const isProtectedRoute =
      path.startsWith("/settings") ||
      path.startsWith("/profile") ||
      path.startsWith("/bookmarks") ||
      path.startsWith("/notifications") ||
      path.startsWith("/admin");

    // Dashboard is always public
    if (isDashboardRoute) {
      return NextResponse.next();
    }

    // Only protected routes below this point
    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token.error === "RefreshAccessTokenError") {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "SessionExpired");
      return NextResponse.redirect(url);
    }

    if (token.user?.emailVerified === false && !path.startsWith("/verify-email")) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }

    if (path.startsWith("/admin") && token.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith("/dashboard")) {
          return true;
        }

        if (
          path.startsWith("/settings") ||
          path.startsWith("/profile") ||
          path.startsWith("/bookmarks") ||
          path.startsWith("/notifications") ||
          path.startsWith("/admin")
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/bookmarks/:path*",
    "/notifications/:path*",
  ],
};;