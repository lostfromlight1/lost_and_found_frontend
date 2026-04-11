"use client";

import { useState } from "react";
import { UserManagementTable } from "@/features/admin/components/UserManagementTable";
import { CategoryManagementTable } from "@/features/admin/components/CategoryManagementTable";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";
import { ShieldCheckIcon, Users, Tag } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [activeView, setActiveView] = useState<"users" | "categories">("users");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon size={32} className="text-destructive" weight="fill" />
        <DashboardHeader
          title="Admin Panel"
          description="Manage system users, categories, and moderation actions."
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={activeView === "users" ? "default" : "outline"}
          onClick={() => setActiveView("users")}
          className="flex items-center gap-2"
        >
          <Users size={18} />
          User Management
        </Button>
        <Button
          variant={activeView === "categories" ? "default" : "outline"}
          onClick={() => setActiveView("categories")}
          className="flex items-center gap-2"
        >
          <Tag size={18} />
          Category Management
        </Button>
      </div>

      {/* Active View */}
      <section className="bg-white p-6 border rounded-xl shadow-sm">
        {activeView === "users" ? (
          <UserManagementTable />
        ) : (
          <CategoryManagementTable />
        )}
      </section>
    </div>
  );
}
