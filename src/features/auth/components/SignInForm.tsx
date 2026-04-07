"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CheckboxForm from "@/components/form/CheckboxForm";
import InputForm from "@/components/form/InputForm";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

interface SignInFormData {
  email: string;
  password: string;
  remember: boolean;
}

export function SignInForm() {
  const form = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const { loginAction, isPending } = useAuthActions();

  function onSubmit(values: SignInFormData) {
    loginAction({
      email: values.email,
      password: values.password,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <InputForm<SignInFormData>
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          inputClassName="h-11 rounded-md border-border px-3 text-sm focus-visible:border-primary focus-visible:ring-ring/30"
        />

        <InputForm<SignInFormData>
          control={form.control}
          name="password"
          label="Password"
          type="password"
          required
          placeholder="Enter your password"
          autoComplete="current-password"
          inputClassName="h-11 rounded-md border-border px-3 text-sm focus-visible:border-primary focus-visible:ring-ring/30"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <CheckboxForm<SignInFormData>
            control={form.control}
            name="remember"
            label="Remember me"
            rules={{ required: false }}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
