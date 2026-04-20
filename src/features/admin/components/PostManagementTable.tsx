"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react"; 
import AppTable, { TableColumn } from "@/components/AppTable"; 
import { usePosts, useDeletePost } from "@/features/post/hooks/usePosts";
import { PostResponseDto } from "@/features/post/api/response/posts.response";
import PostFormModal from "@/features/post/components/PostFormModal";
import { cn } from "@/lib/utils";

export default function PostManagementTable() {
  const [page] = useState(0); 
  const [size] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<PostResponseDto | null>(null);

  const { data: pageData, isLoading } = usePosts({ page, size });
  const posts = pageData?.content || [];

  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const handleAdd = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (post: PostResponseDto) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePost(id);
    }
  };

  const columns: TableColumn<PostResponseDto>[] = [
    { 
      key: "id", 
      header: "ID", 
      width: 80 
    },
    { 
      key: "title", 
      header: "Title", 
      className: "font-medium max-w-[200px] truncate",
      render: (val) => <span title={String(val)}>{String(val)}</span> 
    },
    {
      key: "user",
      header: "Author",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {row.user?.displayName ?? "Unknown"}
          </span>
          <span className="text-xs text-slate-500">
            {row.user?.email ?? "No email"}
          </span>
        </div>
      )
    },
    { 
      key: "type", 
      header: "Type",
      render: (val) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold",
          val === "LOST" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        )}>
          {String(val)}
        </span>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (val) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold",
          val === "OPEN" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
        )}>
          {String(val)}
        </span>
      )
    },
    { key: "location", header: "Location", className: "text-sm text-gray-600" },
    { key: "lostFoundDate", header: "Date", className: "text-sm text-gray-600" },
    {
      key: "actions",
      header: "Actions",
      width: 120,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
            <Pencil size={16} className="text-slate-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AppTable<PostResponseDto>
        columns={columns}
        data={posts}
        loading={isLoading}
        addLabel="Create Post"
        onAdd={handleAdd}
      />

      <PostFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        postToEdit={postToEdit} 
      />
    </div>
  );
}
