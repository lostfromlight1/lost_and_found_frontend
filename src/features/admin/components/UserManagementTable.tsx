"use client";

import { useState } from "react";
import AppTable, { TableColumn } from "@/components/AppTable";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import { useUsers, useBanUser } from "@/features/users/hooks/useUsers";
import { UserResponse } from "@/features/auth/api/response/auth.response";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserManagementTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [userToBan, setUserToBan] = useState<UserResponse | null>(null);

  // Fetching data from your Spring Boot UserController
  const { data, isLoading } = useUsers(search, page);
  const { mutate: banUser, isPending: isBanning } = useBanUser();

  const handleConfirmBan = () => {
    if (userToBan) {
      banUser(Number(userToBan.id)); // Assuming UserResponse id is number/string
      setUserToBan(null);
    }
  };

  // Explicitly typing the columns based on UserResponse
  const columns: TableColumn<UserResponse>[] = [
    { 
      key: "id", 
      header: "ID", 
      width: 80 
    },
    { 
      key: "displayName", 
      header: "Name",
      render: (val) => <span className="font-medium text-gray-900">{val as string}</span>
    },
    { 
      key: "email", 
      header: "Email" 
    },
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
          variant="destructive" 
          size="sm" 
          disabled={row.role === "ADMIN" || (isBanning && userToBan?.id === row.id)} 
          onClick={() => setUserToBan(row)}
        >
          {isBanning && userToBan?.id === row.id ? "Banning..." : "Ban"}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <AppTable
        columns={columns}
        data={(data?.content as UserResponse[]) || []} // Handling paginated response
        loading={isLoading}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Search users by name or email..."
      />
      
      <DeleteConfirmationDialog
        open={!!userToBan}
        onOpenChange={(open) => !open && setUserToBan(null)}
        onConfirm={handleConfirmBan}
        itemName={userToBan?.displayName}
        title="Ban User Account"
        description={`Are you sure you want to ban ${userToBan?.displayName}? This will revoke their session and lock the account.`}
        confirmLabel="Ban User"
      />
    </div>
  );
}
