"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUpdateProfile, useUploadAvatar } from "@/features/users/hooks/useUsers";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputForm from "@/components/form/InputForm";
import { Loader2, Camera } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  contactInfo: z
    .string()
    .trim()
    .min(1)
    .regex(/^\+[0-9]+$/, {
      message: "Use format: +959xxxxxxxx",
    })
    .max(255),
});

export function ProfileSettingsForm() {
  const { data: session, update: updateSession } = useSession();

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", contactInfo: "" },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        displayName: session.user.displayName || "",
        contactInfo: session.user.contactInfo || "",
      });
    }
  }, [session, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    if (!form.formState.isDirty) {
      toast.warning("No changes detected.");
      return;
    }

    updateProfile(data, {
      onSuccess: async () => {
        await updateSession();
        form.reset(data);
        toast.success("Profile updated");
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB only");
      return;
    }

    uploadAvatar(file, {
      onSuccess: async () => {
        await updateSession();
        toast.success("Avatar updated");
      },
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      
      {/* Avatar Upload Section */}
      <div className="flex items-center gap-6 pb-8 border-b border-slate-200/60">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}>
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-sm ring-1 ring-slate-200 bg-slate-100">
            {session?.user?.avatarUrl ? (
              <img
                src={session.user.avatarUrl}
                className="h-full w-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-100 text-3xl font-black text-slate-400">
                {session?.user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
            {isUploading ? (
              <Loader2 className="animate-spin text-white h-6 w-6" />
            ) : (
              <Camera className="text-white h-6 w-6" />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-[16px] font-black text-slate-900">Profile Picture</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Click your avatar to upload a new image.<br/>
            Must be under 5MB.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <InputForm
            control={form.control}
            name="displayName"
            label="Display Name"
            required
          />

          <InputForm
            control={form.control}
            name="contactInfo"
            label="Contact Number"
            placeholder="+959xxxxxxxx"
            required
          />

          <Button
            type="submit"
            className="w-full mt-4 rounded-full h-11 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[14px] transition-colors shadow-sm"
            disabled={isUpdating || !form.formState.isDirty}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Saving changes...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
