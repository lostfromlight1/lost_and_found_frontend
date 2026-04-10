// src/features/auth/components/SessionSync.tsx

"use client";

import { useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { getCurrentUserApi } from "@/features/users/api/users.api";

export function SessionSync() {
  const { status } = useSession();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only run this check once when the app mounts and NextAuth says "unauthenticated"
    if (status === "unauthenticated" && !hasChecked.current) {
      hasChecked.current = true;

      getCurrentUserApi()
        .then(() => {
          // The backend accepted our cookies! Tell NextAuth to sync the UI session.
          signIn("credentials", { action: "sync", redirect: false });
        })
        .catch(() => {
          // Cookies are dead or missing. Do nothing, they are truly logged out.
        });
    }
  }, [status]);

  return null; // This component is invisible
}
