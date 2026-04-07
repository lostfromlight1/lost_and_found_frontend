import { Metadata } from "next";
import { SignInForm } from "@/features/auth/components/SignInForm";

export const metadata: Metadata = {
  title: "Login | Lost & Found Dashboard",
  description: "Sign in to manage lost and found items.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the website
          </p>
        </div>

        {/* The feature component encapsulates all form state and API logic */}
        <SignInForm />
      </div>
    </main>
  );
}
