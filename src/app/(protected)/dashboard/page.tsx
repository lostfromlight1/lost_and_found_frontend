import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";

import {
  PackageIcon,
  MapPinIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { title } from "process";

import PostFeed from "@/features/post/components/PostFeed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const stats = [
    {
      title: "My Reports",
      value: 0,
      desc: "Active lost/found items",
      icon: PackageIcon,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Nearby Items",
      value: 12,
      desc: "Items found in your area",
      icon: MapPinIcon,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Resolved",
      value: 5,
      desc: "Items returned safely",
      icon: ClockIcon,
      color: "from-green-500 to-emerald-500",
    },

    {
      title: "Total Users",
      value: 1200,
      desc: "Community members",
      icon: PackageIcon,
      color: "from-purple-500 to-pink-500",
    },

    {
      title: "Total Items",
      value: 3500,
      desc: "All reported items",
      icon: MapPinIcon,
      color: "from-yellow-500 to-red-500",
    },

    {
      title: "Resolved Cases",
      value: 2800,
      desc: "Items successfully returned",
      icon: ClockIcon,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (

    <div className="space-y-8">
      <DashboardHeader
        title="My Dashboard"
        description={`Welcome back, ${session?.user?.displayName || "User"} `} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1"
            >
              {/* Gradient Glow */}
              <div
                className={`absolute inset-0 opacity-5 bg-gradient-to-br ${stat.color}`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
                  >
                    <Icon size={22} weight="fill" />
                  </div>

                  <span className="text-xs text-muted-foreground">
                    Updated now
                  </span>
                </div>

                <h3 className="text-sm text-muted-foreground">
                  {stat.title}
                </h3>

                <p className="text-4xl font-bold mt-1 tracking-tight">
                  {stat.value}
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
              <div>
                <p className="font-medium">You reported a lost wallet</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
              <div>
                <p className="font-medium">Phone returned successfully</p>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
                Resolved
              </span>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4">
              No more activity
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="space-y-3">
            <button className="w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
              Report Lost Item
            </button>

            <button className="w-full p-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition">
              Report Found Item
            </button>

            <button className="w-full p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition">
              View All Items
            </button>
          </div>
        </div>
      </div>
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