"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRequestPasswordReset } from "@/features/auth/hooks/useAuthMutations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export function ForgotPasswordForm() {
  const { mutate: requestReset, isPending } = useRequestPasswordReset();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    requestReset(data.email);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter your email and we will send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <InputForm
            control={form.control}
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
          />
          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
