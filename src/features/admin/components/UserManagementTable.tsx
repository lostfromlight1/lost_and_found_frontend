"use client";

import { useState } from "react";
import AppTable, { TableColumn } from "@/components/AppTable";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import { useUsers, useBanUser, useUnbanUser } from "@/features/users/hooks/useUsers";
import { UserResponse } from "@/features/auth/api/response/auth.response";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserManagementTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  
  // State to track which user is being acted upon
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
          "px-2 py-1 rounded text-xs font-semibold", 
          val === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        )}>
          {val as string}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      render: (_, row) => (
        <Button 
          variant={row.isLocked ? "outline" : "destructive"} 
          size="sm" 
          disabled={row.role === "ADMIN" || (isActionPending && userToToggle?.id === row.id)} 
          onClick={() => setUserToToggle(row)}
        >
          {isActionPending && userToToggle?.id === row.id 
            ? "Processing..." 
            : row.isLocked ? "Unban" : "Ban"}
        </Button>
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
