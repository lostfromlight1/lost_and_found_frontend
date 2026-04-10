import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import {
  PackageIcon,
  MapPinIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="My Dashboard" 
        description={`Welcome back, ${session?.user?.displayName}`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <PackageIcon size={24} weight="fill" />
            </div>
            <h3 className="font-semibold text-lg">My Reports</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Active lost/found items</p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <MapPinIcon size={24} weight="fill" />
            </div>
            <h3 className="font-semibold text-lg">Nearby Items</h3>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground mt-1">Items found in your area</p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ClockIcon size={24} weight="fill" />
            </div>
            <h3 className="font-semibold text-lg">Resolved</h3>
          </div>
          <p className="text-3xl font-bold">5</p>
          <p className="text-sm text-muted-foreground mt-1">Items returned safely</p>
        </div>
      </div>
      
      {/* Feed placeholder */}
      <div className="bg-white border rounded-xl p-12 text-center">
        <p className="text-slate-400">Your recent activity will appear here.</p>
      </div>
    </div>
  );
}
