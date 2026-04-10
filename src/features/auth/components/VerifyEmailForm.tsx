// src/features/auth/components/VerifyEmailForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import InputForm from "@/components/form/InputForm";
import { useVerifyEmail } from "@/features/auth/hooks/useAuthActions";

const formSchema = z.object({
  token: z.string().min(10, "Invalid token format"),
});

type VerifyEmailFormData = z.infer<typeof formSchema>;

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: urlToken || "",
    },
  });

  const { mutate: verify, isPending } = useVerifyEmail();

  // If the URL has a token, automatically populate the input
  useEffect(() => {
    if (urlToken) {
      form.setValue("token", urlToken);
    }
  }, [urlToken, form]);

  function onSubmit(values: VerifyEmailFormData) {
    verify(values.token);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Paste the verification code sent to your email, or click the link in the email directly.
          </p>
        </div>

        <InputForm<VerifyEmailFormData>
          control={form.control}
          name="token"
          label="Verification Code"
          type="text"
          placeholder="Paste your UUID token here..."
          inputClassName="h-11 rounded-md border-border px-3 text-sm focus-visible:border-primary"
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
    </Form>
  );
}
