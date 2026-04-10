"use client";

import { useVerifyEmail, useResendVerification } from "@/features/auth/hooks/useAuthMutations";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";

// 1. Schema for the Verification Code
const verifySchema = z.object({
  token: z.string()
    .min(6, { message: "Code must be 6 characters" })
    .max(6, { message: "Code must be 6 characters" })
    .toUpperCase(), // Auto-convert to uppercase to match backend
});

// 2. Schema for Resending Email
const resendSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;
type ResendFormValues = z.infer<typeof resendSchema>;

export function VerifyEmailForm() {
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resendEmail, isPending: isResending } = useResendVerification();
  
  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token: "" },
  });

  const resendForm = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
  });

  const onVerifySubmit = (data: VerifyFormValues) => {
    verifyEmail(data.token);
  };

  const onResendSubmit = (data: ResendFormValues) => {
    resendEmail(data.email);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm text-center">
      
      {/* VERIFICATION CODE SECTION */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h2>
      <p className="text-slate-600 mb-6 text-sm">
        We sent a 6-character code to your email. Enter it below to activate your account.
      </p>

      <Form {...verifyForm}>
        <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
          <InputForm
            control={verifyForm.control}
            name="token"
            type="text"
            placeholder="e.g. G2JK45"
            inputClassName="text-center text-2xl tracking-widest uppercase font-mono"
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Account"}
          </Button>
        </form>
      </Form>

      {/* RESEND SECTION */}
      <div className="mt-8 border-t pt-6 text-left">
        <p className="text-sm font-medium text-slate-700 mb-4">Didn&apos;t receive the code?</p>
        
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
              className="w-full" 
              variant="outline"
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </form>
        </Form>
      </div>
      
      <Link href="/login" className="block mt-6 text-sm text-primary font-medium hover:underline">
        Return to Login
      </Link>
    </div>
  );
}
