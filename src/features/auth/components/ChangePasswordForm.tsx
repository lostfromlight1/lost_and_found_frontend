"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChangePassword } from "@/features/auth/hooks/useAuthMutations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min 8 chars").regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/, "Complex password required"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords match fail", path: ["confirmPassword"]
});

export function ChangePasswordForm() {
  const { mutate: change, isPending } = useChangePassword();
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    change(data, {
      onSuccess: () => {
        form.reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <InputForm control={form.control} name="oldPassword" label="Current Password" type="password" required />
        <InputForm control={form.control} name="newPassword" label="New Password" type="password" required />
        <InputForm control={form.control} name="confirmPassword" label="Confirm Password" type="password" required />
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
