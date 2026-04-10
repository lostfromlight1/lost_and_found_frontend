import { UserManagementTable } from "@/features/admin/components/UserManagementTable";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon size={32} className="text-destructive" weight="fill" />
        <DashboardHeader
          title="Admin Panel"
          description="Manage system users and moderation actions."
        />
      </div>
      <section className="bg-white p-6 border rounded-xl shadow-sm">
        <UserManagementTable />
      </section>
    </div>
  );
}
