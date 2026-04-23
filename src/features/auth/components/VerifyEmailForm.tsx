"use client";

import { useVerifyEmail, useResendVerification } from "@/features/auth/hooks/useAuthMutations";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";
import { useEffect } from "react"; 
import { MailCheck } from "lucide-react";

const verifySchema = z.object({
  token: z.string()
    .min(6, { message: "Code must be 6 characters" })
    .max(6, { message: "Code must be 6 characters" })
    .toUpperCase(), 
});

const resendSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;
type ResendFormValues = z.infer<typeof resendSchema>;

export function VerifyEmailForm({ token }: { token?: string | null }) {
  const router = useRouter();
  
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resendEmail, isPending: isResending } = useResendVerification();
  
  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token: token || "" },
  });

  const resendForm = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (token) {
      verifyEmail(token, {
        onSuccess: () => {
          // Note: Your updated useVerifyEmail hook already handles redirecting to /dashboard.
          // The router.push here acts as a fallback.
          router.push("/dashboard");
        }
      });
    }
  }, [token, verifyEmail, router]);

  const onVerifySubmit = (data: VerifyFormValues) => {
    verifyEmail(data.token);
  };

  const onResendSubmit = (data: ResendFormValues) => {
    resendEmail(data.email);
  };

  // Loading state for URL token processing
  if (token) {
    return (
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-slate-200 rounded-2xl shadow-sm text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <MailCheck size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Verifying...</h2>
        <p className="text-slate-500 font-medium">Please wait while we securely confirm your code.</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-slate-200 rounded-2xl shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-full flex items-center justify-center mx-auto mb-6">
          <MailCheck size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Verify your email</h2>
        <p className="text-slate-500 font-medium text-[14px]">
          We sent a 6-character code to your email. Enter it below to activate your account.
        </p>
      </div>

      {/* Verify Code Form */}
      <Form {...verifyForm}>
        <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
          <InputForm
            control={verifyForm.control}
            name="token"
            type="text"
            placeholder="e.g. G2JK45"
            // Special styling for the 6-character code input
            inputClassName="text-center text-2xl tracking-[0.25em] uppercase font-mono h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors placeholder:tracking-normal placeholder:normal-case placeholder:text-base"
          />
          <Button 
            type="submit" 
            className="w-full rounded-full h-12 font-bold text-[15px] bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-none" 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Account"}
          </Button>
        </form>
      </Form>

      {/* Resend Section */}
      <div className="mt-8 border-t border-slate-100 pt-8">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-900 mb-4 text-center">
          Didn`&apos;`t receive the code? 
        </h3>
        
        <Form {...resendForm}>
          <form onSubmit={resendForm.handleSubmit(onResendSubmit)} className="space-y-4">
            <InputForm
              control={resendForm.control}
              name="email"
              type="email"
              placeholder="Enter your registered email"
            />
            <Button 
              type="submit" 
              className="w-full rounded-full h-11 font-bold text-[14px] border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-none" 
              variant="outline"
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Footer */}
      <Link href="/login" className="block mt-6 text-sm text-center text-slate-500 font-medium hover:text-slate-900 transition-colors">
        Return to Login
      </Link>
    </div>
  );
}
