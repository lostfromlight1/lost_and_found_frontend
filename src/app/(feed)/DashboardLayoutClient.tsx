"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import PostFormModal from "@/features/post/components/PostFormModal";
import { useFcmInit } from "@/features/notifications/hooks/useFcmInit";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const isLoggedIn = status === "authenticated";

    useFcmInit();
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

    return (
        <div className="h-screen w-full bg-[#f0f2f5] flex overflow-hidden">
            <div className="hidden sm:flex flex-col w-20 xl:w-[280px] shrink-0 h-full overflow-y-auto scrollbar-hide">
                <LeftSidebar
                    onPostClick={isLoggedIn ? () => setIsGlobalModalOpen(true) : undefined}
                />
            </div>

            <div className="flex flex-col flex-1 h-full min-w-0 p-0 sm:py-4 sm:pr-4 sm:pl-0 lg:py-5 lg:pr-5 lg:pl-0 overflow-y-auto scrollbar-hide">
                {children}
            </div>

            {isLoggedIn && (
                <PostFormModal
                    open={isGlobalModalOpen}
                    onOpenChange={setIsGlobalModalOpen}
                />
            )}
        </div>
    );
}