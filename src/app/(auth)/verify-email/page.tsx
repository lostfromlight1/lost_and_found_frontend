import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Verify Email | Lost & Found",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-100 rounded-lg" />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
