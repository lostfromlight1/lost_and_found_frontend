"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUpdateProfile } from "@/features/users/hooks/useUsers";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";

const profileSchema = z.object({
  displayName: z.string().min(1, { message: "Required" }).max(100),
  contactInfo: z.string().max(255).optional().or(z.literal("")),
});

export function ProfileSettingsForm() {
  const { data: session } = useSession();
  const { mutate: update, isPending } = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", contactInfo: "" },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({ displayName: session.user.displayName, contactInfo: session.user.contactInfo || "" });
    }
  }, [session, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => update(d))} className="space-y-4 max-w-md">
        <InputForm control={form.control} name="displayName" label="Display Name" required />
        <InputForm control={form.control} name="contactInfo" label="Contact Info" />
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
