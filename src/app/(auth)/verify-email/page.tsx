// src/app/(auth)/verify-email/page.tsx
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-sm border border-border">
        {/* Suspense is required by Next.js when using useSearchParams in a client component */}
        <Suspense fallback={<p>Loading...</p>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
