"use client";

import { useState } from "react";
import { UserManagementTable } from "@/features/admin/components/UserManagementTable";
import { CategoryManagementTable } from "@/features/admin/components/CategoryManagementTable";
import PostManagementTable from "@/features/admin/components/PostManagementTable";
import ReportManagementTable from "@/features/admin/components/ReportManagementTable";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import { UsersIcon, TagIcon, ArticleIcon, FlagIcon } from "@phosphor-icons/react/dist/ssr";

export default function AdminPage() {
  const [activeView, setActiveView] = useState<"users" | "categories" | "posts" | "reports">("users");

  const navItems = [
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "categories", label: "Categories", icon: TagIcon },
    { id: "posts", label: "Posts", icon: ArticleIcon },
    { id: "reports", label: "Reports", icon: FlagIcon },
  ] as const;

  return (
    // Increased max-width to allow the content to stretch across the wide card
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12">
      <DashboardHeader
        title="Admin Panel"
        description="Manage system users, categories, posts, and moderation actions."
      />

      {/* Modern, Minimalist Tab Navigation */}
      <div className="flex flex-wrap gap-2 mt-10 border-b border-slate-200/60 pb-6">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[14px] transition-all ${
                isActive
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium"
              }`}
            >
              <item.icon size={18} weight={isActive ? "fill" : "regular"} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Active View Container - Let this expand fully */}
      <section className="mt-8 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 w-full">
        {activeView === "users" && <UserManagementTable />}
        {activeView === "categories" && <CategoryManagementTable />}
        {activeView === "posts" && <PostManagementTable />}
        {activeView === "reports" && <ReportManagementTable />}
      </section>
    </div>
  );
}
