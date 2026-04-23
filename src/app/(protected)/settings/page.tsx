import { ProfileSettingsForm } from "@/features/users/components/ProfileSettingsForm";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";

export const metadata = {
  title: "Settings | Back2U",
};

export default function SettingsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 lg:p-12">
      <DashboardHeader 
        title="Account Settings" 
        description="Update your profile information and security preferences."
      />

      <div className="space-y-8 mt-10">
        
        {/* Profile Section */}
        <section className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
          <div className="mb-8 border-b border-slate-200/60 pb-5">
            <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900">
              Profile Information
            </h2>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              This info is visible to other users on your posts.
            </p>
          </div>
          <ProfileSettingsForm />
        </section>

        {/* Security Section */}
        <section className="bg-red-50/30 border border-red-100 rounded-2xl p-6 md:p-8">
          <div className="mb-8 border-b border-red-100 pb-5">
            <h2 className="text-[13px] font-black uppercase tracking-widest text-red-600">
              Security
            </h2>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage and update your account password.
            </p>
          </div>
          <ChangePasswordForm />
        </section>

      </div>
    </div>
  );
}
