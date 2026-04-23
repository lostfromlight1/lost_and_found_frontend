import { ProfileSettingsForm } from "@/features/users/components/ProfileSettingsForm";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"; // <-- Added Import
import { DashboardHeader } from "@/features/users/components/DashboardHeader";

export const metadata = {
  title: "Settings | Back2U",
};

export default function SettingsPage() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-sm sm:rounded-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/30">
          <DashboardHeader 
            title="Account Settings" 
            description="Update your profile information and security preferences."
          />
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          {/* Profile Section */}
          <section>
            <div className="mb-6 border-b border-slate-200/60 pb-4">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900">
                Profile Information
              </h2>
              <p className="text-[14px] text-slate-500 mt-1 font-medium">
                This info is visible to other users on your posts.
              </p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
               <ProfileSettingsForm />
            </div>
          </section>

          {/* Security Section (Change Password) */}
          <section>
            <div className="mb-6 border-b border-red-100 pb-4">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-red-600">
                Security
              </h2>
              <p className="text-[14px] text-slate-500 mt-1 font-medium">
                Manage and update your account password.
              </p>
            </div>
            <div className="bg-red-50/20 border border-red-100 rounded-2xl p-6 md:p-8">
               <ChangePasswordForm />
            </div>
          </section>

          {/* NEW: Password Recovery Section */}
          <section>
            <div className="mb-6 border-b border-slate-200/60 pb-4">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900">
                Password Recovery
              </h2>
              <p className="text-[14px] text-slate-500 mt-1 font-medium">
                Forgot your current password? Send a secure reset link to your email.
              </p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
               <ForgotPasswordForm />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
