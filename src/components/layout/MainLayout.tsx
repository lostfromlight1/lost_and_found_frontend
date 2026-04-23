"use client";

import LeftSidebar from "@/components/layout/LeftSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  onPostClick: () => void;
}

export default function MainLayout({ children, rightSidebar, onPostClick }: MainLayoutProps) {
  return (
    <div className="h-screen bg-[#f0f2f5] flex justify-center p-2 sm:p-4 w-full overflow-hidden">
      
      {/* Main Container */}
      <div className="flex w-full max-w-480 h-full gap-4 xl:gap-6">

        {/* 1. LEFT SIDEBAR */}
        <div className="hidden sm:flex flex-col w-20 xl:w-65 h-full shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           <LeftSidebar onPostClick={onPostClick} />
        </div>

        {/* 2. THE WHITE CARD */}
        <div className="flex flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full">
          
          {/* MAIN CONTENT (Middle) - Only applies borders/widths if right sidebar exists */}
          <main className={`flex-1 w-full h-full overflow-y-auto bg-white flex flex-col relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${rightSidebar ? 'max-w-225 mx-auto border-r border-slate-100' : ''}`}>
            {children}
          </main>

          {/* OPTIONAL RIGHT SIDEBAR */}
          {rightSidebar && (
            <div className="hidden lg:block shrink-0 bg-slate-50/30 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {rightSidebar}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
