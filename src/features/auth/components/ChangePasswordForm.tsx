"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChangePassword } from "@/features/auth/hooks/useAuthMutations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";
import ConfirmationDialog from "@/components/model/ConfirmationDialog";

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
  
  // Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<z.infer<typeof passwordSchema> | null>(null);

  // Intercept the submit to open the dialog
  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  // Execute the actual mutation when confirmed
  const handleConfirm = () => {
    setIsConfirmOpen(false); // Close dialog immediately
    if (pendingData) {
      change(pendingData, {
        onSuccess: () => {
          form.reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
          setPendingData(null);
        }
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <InputForm 
            control={form.control} 
            name="oldPassword" 
            label="Current Password" 
            type="password" 
            required 
          />
          <InputForm 
            control={form.control} 
            name="newPassword" 
            label="New Password" 
            type="password" 
            required 
          />
          <InputForm 
            control={form.control} 
            name="confirmPassword" 
            label="Confirm Password" 
            type="password" 
            required 
          />
          
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-4 rounded-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] transition-colors shadow-sm"
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Form>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Update Password"
        description="Are you sure you want to change your password? You will need to use your new password the next time you sign in."
        confirmLabel="Update Password"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
      />
    </>
  );
}
