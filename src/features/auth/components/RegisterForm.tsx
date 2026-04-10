// src/features/auth/components/RegisterForm.tsx
"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import InputForm from "@/components/form/InputForm";
import { useRegister } from "@/features/auth/hooks/useAuthActions";
import { useAppForm } from "@/hooks/useAppForm"; 

const formSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  contactInfo: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const form = useAppForm<RegisterFormData>({
    schema: formSchema,
    defaultValues: { displayName: "", email: "", password: "", contactInfo: "" },
  });

  const { mutate: register, isPending } = useRegister();

  function onSubmit(values: RegisterFormData) {
    register({
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      ...(values.contactInfo && { contactInfo: values.contactInfo }),
    });
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/oauth2/authorization/google`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <InputForm<RegisterFormData> control={form.control} name="displayName" label="Display Name" type="text" placeholder="John Doe" />
        <InputForm<RegisterFormData> control={form.control} name="email" label="Email" type="email" placeholder="you@example.com" />
        <InputForm<RegisterFormData> control={form.control} name="contactInfo" label="Contact Info (Optional)" type="text" placeholder="Phone or Telegram" />
        <InputForm<RegisterFormData> control={form.control} name="password" label="Password" type="password" placeholder="Create a strong password" />

        <Button type="submit" disabled={isPending} className="h-11 w-full font-semibold">
          {isPending ? "Creating account..." : "Create Account"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or register with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="h-11 w-full font-semibold" onClick={handleGoogleLogin}>
          Google
        </Button>
      </form>
    </Form>
  );
}
