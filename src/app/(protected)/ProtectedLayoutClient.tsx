"use client";

import { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import PostFormModal from "@/features/post/components/PostFormModal";
import { useFcmInit } from "@/features/notifications/hooks/useFcmInit";

export default function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  useFcmInit(); 
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#f0f2f5] flex overflow-hidden">
      {/* 1. GLOBAL LEFT SIDEBAR */}
      <div className="hidden sm:flex flex-col w-20 xl:w-[280px] shrink-0 h-full overflow-y-auto scrollbar-hide">
         <LeftSidebar onPostClick={() => setIsGlobalModalOpen(true)} />
      </div>

      {/* 2. DYNAMIC PAGE CONTENT - Fixed to handle independent scrolling */}
      <div className="flex-1 h-full min-w-0 p-0 sm:py-4 sm:pr-4 sm:pl-0 lg:py-5 lg:pr-5 lg:pl-0 overflow-y-auto scrollbar-hide">
         {children}
      </div>
      
      <PostFormModal open={isGlobalModalOpen} onOpenChange={setIsGlobalModalOpen} />
    </div>
  );
}
