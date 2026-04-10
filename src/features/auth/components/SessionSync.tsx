// src/features/auth/components/SessionSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";

export function SessionSync() {
  const { status } = useSession();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only run once when NextAuth says "unauthenticated"
    if (status === "unauthenticated" && !hasChecked.current) {
      hasChecked.current = true;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-default-dev-key";

      // 🚨 CRITICAL FIX: We use raw `fetch` here instead of `apiClient`
      // This prevents a 401 response from triggering the Axios interceptor's infinite logout loop.
      fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-API-KEY": API_KEY,
        },
        credentials: "include", // Sends the HttpOnly cookies to see if they are valid
      })
        .then((res) => {
          if (res.ok) {
            // The backend accepted our cookies! Tell NextAuth to sync the UI session.
            signIn("credentials", { action: "sync", redirect: false });
          }
        })
        .catch((err) => {
          // Network error or 401. Do nothing. The user is truly logged out.
          console.debug("Session sync check failed/unauthenticated", err);
        });
    }
  }, [status]);

  return null;
}
