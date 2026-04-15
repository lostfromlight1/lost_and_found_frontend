"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react"; 
import AppTable, { TableColumn } from "@/components/AppTable"; 
import { usePosts, useDeletePost } from "@/features/post/hooks/usePosts";
import { PostResponseDto } from "@/features/post/api/response/posts.response";
import PostFormModal from "@/features/post/components/PostFormModal";

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
    { key: "id", header: "ID", width: "80px", className: "text-center" },
    { key: "title", header: "Title", className: "font-medium" },
    { 
      key: "type", 
      header: "Type",
      render: (val) => (
        <span className={`px-2 py-1 text-xs rounded-full ${val === "LOST" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {String(val)}
        </span>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (val) => (
        <span className={`px-2 py-1 text-xs rounded-full ${val === "OPEN" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
          {String(val)}
        </span>
      )
    },
    { key: "location", header: "Location" },
    { key: "lostFoundDate", header: "Date" },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)}>
            <Pencil size={16} />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Posts Management</h1>
      </div>

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
