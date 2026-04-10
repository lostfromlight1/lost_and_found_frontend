import { ProfileSettingsForm } from "@/features/users/components/ProfileSettingsForm";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Settings | Lost & Found",
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <DashboardHeader 
        title="Account Settings" 
        description="Update your profile information and security preferences."
      />

      <div className="space-y-12">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Profile Information</h2>
            <p className="text-sm text-muted-foreground">This info is visible to other users.</p>
          </div>
          <ProfileSettingsForm />
        </section>

        <Separator />

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-red-600">Security</h2>
            <p className="text-sm text-muted-foreground">Manage your account password.</p>
          </div>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
