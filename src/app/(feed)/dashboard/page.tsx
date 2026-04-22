import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import PostFeed from "@/features/post/components/PostFeed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-4">
      <DashboardHeader
        title="My Dashboard"
        description={`Welcome back, ${session?.user?.displayName}`}
      />

      <main className="w-full">
        {/* Main Feed Component replaces the hardcoded cards and placeholder */}
        <PostFeed />
      </main>
    </div>
  );
}
