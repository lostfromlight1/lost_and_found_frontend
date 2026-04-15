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

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { message: "Display name is required" })
    .max(100),
  contactInfo: z
    .string()
    .trim()
    .min(1, { message: "Contact info is required" })
    .regex(/^\+[0-9]+$/, { 
      message: "Must start with '+' followed by numbers (e.g., +959886455064)" 
    })
    .max(255),
});

export function ProfileSettingsForm() {
  // 1. FIXED: Extract the 'update' function from useSession
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
        contactInfo: session.user.contactInfo || ""
      });
    }
  }, [session, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    const { dirtyFields } = form.formState;

    if (Object.keys(dirtyFields).length === 0) {
      toast.warning("Please make a change to update.");
      return;
    }

    updateProfile(data, { 
      // 2. FIXED: Force session refresh after updating profile info
      onSuccess: async () => {
        await updateSession(); 
        form.reset(data); 
        toast.success("Profile updated successfully!");
      } 
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      // 3. FIXED: Force session refresh after uploading avatar
      uploadAvatar(file, {
        onSuccess: async () => {
          await updateSession();
          toast.success("Profile picture updated!");
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      
      {/* Avatar Upload Section */}
      <div className="flex items-center gap-6 p-4 bg-slate-50 border rounded-lg">
        <div 
          className="h-20 w-20 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:opacity-80 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {session?.user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-slate-500">
              {session?.user?.displayName?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-slate-900">Profile Picture</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            disabled={isUploading}
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            {isUploading ? "Uploading..." : "Change Picture"}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
        </div>
      </div>

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
          <InputForm control={form.control} name="displayName" label="Display Name" required />
          <InputForm control={form.control} name="contactInfo" label="Contact Info" placeholder="e.g. +959886455064" required />
          <Button type="submit" disabled={isUpdating || !form.formState.isDirty}>
            {isUpdating ? "Saving..." : "Update Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
