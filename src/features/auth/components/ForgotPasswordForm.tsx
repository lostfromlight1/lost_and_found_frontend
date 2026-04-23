"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRequestPasswordReset, useConfirmPasswordReset } from "@/features/auth/hooks/useAuthMutations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";
import ConfirmationDialog from "@/components/model/ConfirmationDialog";

const requestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

const confirmSchema = z.object({
  token: z.string().min(6, "Code must be 6 characters").max(6).toUpperCase(),
  newPassword: z.string().min(8, "Min 8 chars").regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/, "Complex password required"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords match fail", path: ["confirmPassword"]
});

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [userEmail, setUserEmail] = useState("");

  const { mutate: requestReset, isPending: isRequesting } = useRequestPasswordReset();
  const { mutate: confirmReset, isPending: isConfirming } = useConfirmPasswordReset();

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const confirmForm = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingRequestData, setPendingRequestData] = useState<z.infer<typeof requestSchema> | null>(null);

  // --- STEP 1: Request Code ---
  const onRequestSubmit = (data: z.infer<typeof requestSchema>) => {
    setPendingRequestData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmRequest = () => {
    setIsConfirmOpen(false);
    if (pendingRequestData) {
      requestReset(pendingRequestData.email, {
        onSuccess: () => {
          setUserEmail(pendingRequestData.email);
          setStep("confirm"); // Move to Step 2
          setPendingRequestData(null);
        }
      });
    }
  };

  // --- STEP 2: Confirm Code & Reset Password ---
  const onConfirmSubmit = (data: z.infer<typeof confirmSchema>) => {
    confirmReset({ 
      token: data.token, 
      newPassword: data.newPassword 
    }, {
      onSuccess: () => {
        // Reset state after successful password change
        setStep("request");
        requestForm.reset();
        confirmForm.reset();
      }
    });
  };

  // ------------------------------------------------------------------
  // RENDER: STEP 2
  // ------------------------------------------------------------------
  if (step === "confirm") {
    return (
      <Form {...confirmForm}>
        <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
              We`&apos;`ve sent a 6-character reset code to <span className="font-bold text-slate-900">{userEmail}</span>. 
              Enter it below along with your new password.
            </p>
          </div>

          <InputForm 
            control={confirmForm.control} 
            name="token" 
            label="6-Character Reset Code" 
            placeholder="e.g. G2JK45" 
            inputClassName="uppercase tracking-widest font-mono"
            required 
          />
          <InputForm 
            control={confirmForm.control} 
            name="newPassword" 
            label="New Password" 
            type="password" 
            required 
          />
          <InputForm 
            control={confirmForm.control} 
            name="confirmPassword" 
            label="Confirm New Password" 
            type="password" 
            required 
          />
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={() => setStep("request")} 
              className="text-[13px] text-slate-500 hover:text-slate-900 font-bold transition-colors"
            >
              Cancel
            </button>
            <Button 
              type="submit" 
              disabled={isConfirming}
              className="bg-[#1d9bf0] text-white px-6 py-2 rounded-full font-bold text-[14px] hover:bg-[#1a8cd8] transition-colors shadow-none"
            >
              {isConfirming ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // ------------------------------------------------------------------
  // RENDER: STEP 1
  // ------------------------------------------------------------------
  return (
    <>
      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
          <InputForm
            control={requestForm.control}
            name="email"
            label="Account Email Address"
            type="email"
            placeholder="you@example.com"
            required
          />
          
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
            <Button 
              type="submit" 
              disabled={isRequesting}
              className="bg-[#1d9bf0] text-white px-6 py-2 rounded-full font-bold text-[14px] hover:bg-[#1a8cd8] transition-colors shadow-none"
            >
              {isRequesting ? "Sending Code..." : "Send Reset Code"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Send Reset Code"
        description={`Are you sure you want to send a password reset code to ${pendingRequestData?.email || "this email"}?`}
        confirmLabel="Send Code"
        cancelLabel="Cancel"
        onConfirm={handleConfirmRequest}
      />
    </>
  );
}
