"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useConfirmPasswordReset } from "@/features/auth/hooks/useAuthMutations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/,
      "Password must contain uppercase, lowercase, number, and special character (@#$%^&+=!)"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const { mutate: confirmReset, isPending } = useConfirmPasswordReset();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data: ResetPasswordValues) => {
    if (!token) return;
    confirmReset({ token, newPassword: data.newPassword });
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
        <p className="text-gray-600 mb-4">No password reset token was found in the URL.</p>
        <Button onClick={() => router.push("/forgot-password")} variant="outline">
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
        <p className="text-sm text-gray-500 mt-2">Please enter your new password below.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <InputForm
            control={form.control}
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <InputForm
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full mt-6" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
