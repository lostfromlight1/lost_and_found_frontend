"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PostFormModal from "@/features/post/components/PostFormModal";

export default function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <MainLayout onPostClick={() => setIsCreateModalOpen(true)}>
        {children}
      </MainLayout>

      {/* Keeps the modal functional across all protected pages */}
      <PostFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}
