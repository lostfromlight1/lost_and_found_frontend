// src/app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardHeader user={session.user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample Card 1 */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">My Lost Items</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {/* FIX: Replaced ' with &apos; */}
              You haven&apos;t reported any lost items recently.
            </p>
            <button className="text-primary text-sm font-medium hover:underline">
              Report an item &rarr;
            </button>
          </div>

          {/* Sample Card 2 */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">My Found Reports</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Thank you for helping the community!
            </p>
            <button className="text-primary text-sm font-medium hover:underline">
              View your reports &rarr;
            </button>
          </div>

          {/* Sample Card 3 */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Account Status</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-muted-foreground">Email Verified</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-3 w-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-muted-foreground">Role: {session.user.role}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
