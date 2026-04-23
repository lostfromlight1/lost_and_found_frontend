import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import { NotificationList } from "@/features/notifications/components/NotificationList";

export const metadata = {
  title: "Notifications | Back2U",
};

export default function NotificationsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 lg:p-12">
      <DashboardHeader 
        title="Notifications" 
        description="Stay updated on your posts, comments, and community interactions."
      />

      <div className="mt-10">
        <NotificationList />
      </div>
    </div>
  );
}
