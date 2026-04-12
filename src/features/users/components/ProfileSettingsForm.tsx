"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
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
      form.reset({ 
        displayName: session.user.displayName, 
        contactInfo: session.user.contactInfo || "" 
      });
    }
  }, [session, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    if (!form.formState.isDirty) {
      toast.warning("It looks like your information is exactly the same! Please make a change to update.");
      return;
    }

    update(data, {
      onSuccess: () => {
        form.reset({
          displayName: data.displayName,
          contactInfo: data.contactInfo || ""
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-md">
      {/* Real-time Current Info Display */}
      <div className="p-4 bg-slate-50 border rounded-lg space-y-1">
        <p className="text-sm text-slate-500">
          Display Name: <span className="font-semibold text-slate-900 ml-1">{session?.user?.displayName}</span>
        </p>
        <p className="text-sm text-slate-500">
          Contact Info: 
          {session?.user?.contactInfo ? (
            <span className="font-semibold text-slate-900 ml-1">{session.user.contactInfo}</span>
          ) : (
            <span className="font-medium text-amber-600 italic ml-1">Please add a contact number</span>
          )}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <InputForm 
            control={form.control} 
            name="displayName" 
            label="Display Name" 
            required 
          />
          <InputForm 
            control={form.control} 
            name="contactInfo" 
            label="Contact Info" 
            placeholder="e.g. +1 234 567 8900"
          />
          
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Update Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
