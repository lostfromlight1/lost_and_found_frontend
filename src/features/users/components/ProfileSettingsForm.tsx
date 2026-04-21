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
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white shadow-sm border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-5">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <div className="h-24 w-24 rounded-full overflow-hidden border">
              {session?.user?.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-200 text-2xl font-bold">
                  {session?.user?.displayName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full">
              {isUploading ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                <Camera className="text-white" />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Profile Picture</h2>
            <p className="text-sm text-muted-foreground">
              Click avatar to upload new image
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
        <div className="grid gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">
              {session?.user?.displayName || "-"}
            </span>
          </p>

          <p>
            <span className="text-muted-foreground">Contact:</span>{" "}
            <span className="font-medium">
              {session?.user?.contactInfo || "Not set"}
            </span>
          </p>
        </div>
      </div>
      <div className="bg-white shadow-sm border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

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
              label="Contact Number"
              placeholder="+959xxxxxxxx"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isUpdating || !form.formState.isDirty}
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}