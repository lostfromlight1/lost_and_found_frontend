"use client"

import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"

import { useAuthStore } from "@/store/auth-store"
import { Toaster } from "@/components/ui/sonner"

function AuthStoreHydrator({ children }) {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setAuth({
        user: session.user,
      })
      return
    }

    if (status === "unauthenticated") {
      clearAuth()
    }
  }, [clearAuth, session, setAuth, status])

  return children
}

export default function AppProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthStoreHydrator>{children}</AuthStoreHydrator>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
