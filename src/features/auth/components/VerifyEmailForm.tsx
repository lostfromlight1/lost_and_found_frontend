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
          router.push("/login?message=Email verified successfully! Please log in to access your dashboard.");
        }
      });
    }
  }, [token, verifyEmail, router]);

  const onVerifySubmit = (data: VerifyFormValues) => {
    verifyEmail(data.token, {
      onSuccess: () => {
        router.push("/login?message=Email verified successfully! Please log in to access your dashboard.");
      }
    });
  };

  const onResendSubmit = (data: ResendFormValues) => {
    resendEmail(data.email);
  };

  if (token) {
    return (
      <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
        <p className="text-gray-600">Please wait while we confirm your code.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm text-center">
      
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
