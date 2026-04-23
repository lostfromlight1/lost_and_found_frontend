import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export const metadata = {
  title: "Forgot Password | Back2U",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-slate-200 rounded-2xl shadow-sm flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Reset Password</h2>
          <p className="text-slate-500 font-medium text-[14px]">
            Enter your email to receive a 6-character reset code.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="w-full h-[200px] rounded-xl" />}>
          <ForgotPasswordForm />
        </Suspense>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link href="/login" className="text-sm text-slate-500 font-medium hover:text-slate-900 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
