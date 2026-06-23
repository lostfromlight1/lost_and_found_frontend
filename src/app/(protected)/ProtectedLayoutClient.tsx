"use client";

import { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import PostFormModal from "@/features/post/components/PostFormModal";
import { useFcmInit } from "@/features/notifications/hooks/useFcmInit";

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useFcmInit();
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* FIXED 1: Removed max-w-[1600px] and mx-auto. 
        Changed to w-full so the layout spans the entire screen, pinning the sidebar left.
      */}
      <div className="flex min-h-screen w-full">

        {/* FIXED 2: Moved sticky, h-screen, and scroll classes directly to the aside tag 
          so it scrolls independently from the main feed.
        */}
        <aside className="sticky top-0 hidden h-screen shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-sm lg:flex lg:w-[272px] xl:w-[296px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Since we moved the scroll logic to the aside, the inner div just holds the component */}
          <div className="w-full">
            <LeftSidebar onPostClick={() => setIsGlobalModalOpen(true)} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 px-0 lg:px-5 xl:px-6">
            {children}
          </div>
        </main>
      </div>

      <PostFormModal
        open={isGlobalModalOpen}
        onOpenChange={setIsGlobalModalOpen}
      />
    </div>
  );
}