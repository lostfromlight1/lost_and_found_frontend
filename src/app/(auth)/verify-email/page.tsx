import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Verify Email | Back2U", // Matched to your app's title
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-[500px] rounded-2xl bg-white shadow-sm" />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
