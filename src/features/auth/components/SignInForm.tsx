"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // 1. Import Zod
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CheckboxForm from "@/components/form/CheckboxForm";
import InputForm from "@/components/form/InputForm";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

const formSchema = z.object({
  email: z.email({ 
    error: (issue) => !issue.input ? "Email is required" : "Invalid email address" 
  }),
  
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(), 
});

type SignInFormData = z.infer<typeof formSchema>;

export function SignInForm() {
  const form = useForm<SignInFormData>({
    resolver: zodResolver(formSchema),
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
          placeholder="you@example.com"
          autoComplete="email"
          inputClassName="h-11 rounded-md border-border px-3 text-sm focus-visible:border-primary focus-visible:ring-ring/30"
          // Removed 'required' because Zod handles it now
        />

        <InputForm<SignInFormData>
          control={form.control}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          inputClassName="h-11 rounded-md border-border px-3 text-sm focus-visible:border-primary focus-visible:ring-ring/30"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <CheckboxForm<SignInFormData>
            control={form.control}
            name="remember"
            label="Remember me"
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
