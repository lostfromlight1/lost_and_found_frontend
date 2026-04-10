// src/providers/AppProviders.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ReactNode, useState } from "react";
import { SessionSync } from "@/features/auth/components/SessionSync";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // Initialize React Query client (useState ensures it's not recreated on every render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1, // Only retry failed requests once by default
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        
        {/* Invisible component that fixes NextAuth after Google OAuth redirects */}
        <SessionSync />

        {/* Global Toaster for success/error messages */}
        <Toaster position="top-right" richColors closeButton />
        
        {children}
        
      </SessionProvider>
    </QueryClientProvider>
  );
}
