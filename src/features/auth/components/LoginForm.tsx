// src/features/auth/components/LoginForm.tsx
"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CheckboxForm from "@/components/form/CheckboxForm";
import InputForm from "@/components/form/InputForm";
import { useLogin } from "@/features/auth/hooks/useAuthActions";
import { useAppForm } from "@/hooks/useAppForm"; 

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export type SignInFormData = z.infer<typeof formSchema>;

export function LoginForm() {
  // Using your custom wrapper
  const form = useAppForm<SignInFormData>({
    schema: formSchema,
    defaultValues: { email: "", password: "", remember: false },
  });

  const { mutate: login, isPending } = useLogin();

  function onSubmit(values: SignInFormData) {
    login({ email: values.email, password: values.password });
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/oauth2/authorization/google`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <InputForm<SignInFormData> control={form.control} name="email" label="Email" type="email" placeholder="you@example.com" />
        <InputForm<SignInFormData> control={form.control} name="password" label="Password" type="password" placeholder="Enter your password" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <CheckboxForm<SignInFormData> control={form.control} name="remember" label="Remember me" />
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full font-semibold">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="h-11 w-full font-semibold" onClick={handleGoogleLogin}>
          Google
        </Button>
      </form>
    </Form>
  );
}
