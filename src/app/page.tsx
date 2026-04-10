// src/app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";

export default async function LandingPage() {
  // Check if the user is already logged in on the server
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-14">
        <div className="font-bold text-xl tracking-tight text-primary">
          Lost & Found
        </div>
        <nav className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button variant="default">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="default">Create Account</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-20">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          Find what you lost. <br className="hidden sm:block" />
          <span className="text-primary">Return what you found.</span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground mx-auto">
          The central hub for reporting lost items and reuniting people with their belongings. Secure, fast, and community-driven.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href={session ? "/dashboard" : "/register"}>
            <Button size="lg" className="h-12 px-8 text-base">
              Get Started
            </Button>
          </Link>
          <Link href="/items">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Browse Found Items
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
