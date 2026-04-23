"use client";

import { useState } from "react";
import AppTable, { TableColumn } from "@/components/AppTable";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import { useUsers, useBanUser, useUnbanUser } from "@/features/users/hooks/useUsers";
import { UserResponse } from "@/features/auth/api/response/auth.response";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react"; // <-- ADDED ICONS
import { cn } from "@/lib/utils";

export function UserManagementTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  
  const [userToToggle, setUserToToggle] = useState<UserResponse | null>(null);

  const { data, isLoading } = useUsers(search, page);
  const { mutate: banUser, isPending: isBanning } = useBanUser();
  const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser();

  const handleConfirmAction = () => {
    if (userToToggle) {
      if (userToToggle.isLocked) {
        unbanUser(Number(userToToggle.id));
      } else {
        banUser(Number(userToToggle.id)); 
      }
      setUserToToggle(null);
    }
  };

  const isActionPending = isBanning || isUnbanning;

  const columns: TableColumn<UserResponse>[] = [
    { key: "id", header: "ID", width: 80 },
    { 
      key: "displayName", 
      header: "Name",
      render: (val, row) => (
        <span className={cn("font-medium", row.isLocked ? "text-gray-400 line-through" : "text-gray-900")}>
          {val as string}
        </span>
      )
    },
    { key: "email", header: "Email" },
    { 
      key: "role", 
      header: "Role", 
      render: (val) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold", 
          val === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        )}>
          {val as string}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 120,
      className: "text-center", // <-- CENTERED HEADER
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end"> {/* <-- RIGHT ALIGNED ICONS */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={row.isLocked 
              ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
              : "text-red-500 hover:text-red-700 hover:bg-red-50"}
            disabled={row.role === "ADMIN" || (isActionPending && userToToggle?.id === row.id)} 
            onClick={() => setUserToToggle(row)}
            title={row.isLocked ? "Unban User" : "Ban User"}
          >
            {row.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <AppTable
        columns={columns}
        data={(data?.content as UserResponse[]) || []} 
        loading={isLoading}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Search users by name or email..."
      />
      
      <DeleteConfirmationDialog
        open={!!userToToggle}
        onOpenChange={(open) => !open && setUserToToggle(null)}
        onConfirm={handleConfirmAction}
        itemName={userToToggle?.displayName}
        title={userToToggle?.isLocked ? "Unban User Account" : "Ban User Account"}
        description={
          userToToggle?.isLocked 
          ? `Are you sure you want to unban ${userToToggle?.displayName}? They will be able to log in again.`
          : `Are you sure you want to ban ${userToToggle?.displayName}? This will revoke their session and lock the account.`
        }
        confirmLabel={userToToggle?.isLocked ? "Unban User" : "Ban User"}
      />
    </div>
  );
}
