// src/proxy.ts

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // Retrieve the NextAuth session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const pathname = req.nextUrl.pathname;

  // Define route categories
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/verify-email");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Rule 1: If logged in and trying to access auth pages, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Rule 2: If NOT logged in and trying to access protected routes, redirect to login
  if (isProtectedRoute && !token) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    // Pass the original URL so we can redirect them back after they log in
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

// Specify exactly which routes this middleware should run on to optimize performance
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/login", 
    "/register", 
    "/verify-email"
  ],
};
