"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function MainLayout({ children, rightSidebar }: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-full bg-white rounded-none shadow-sm border-x sm:border border-slate-200 overflow-hidden relative">
      
      {/* MAIN CONTENT (Middle feed) */}
      {/* Added flex flex-col so child pages can stretch to 100% height */}
      <main className={`flex flex-col flex-1 h-full w-full overflow-y-auto bg-white relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${rightSidebar ? 'lg:border-r border-slate-200' : ''}`}>
        {children}
      </main>

      {/* DESKTOP RIGHT SIDEBAR */}
      {rightSidebar && (
        <div className="hidden lg:block shrink-0 bg-slate-50/30 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {rightSidebar}
        </div>
      )}

      {/* MOBILE / TABLET RIGHT SIDEBAR (POPOVER DRAWER) */}
      {rightSidebar && (
        <>
          {/* Floating Action Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden absolute bottom-5 right-5 bg-slate-900 text-white p-3.5 rounded-full shadow-lg hover:bg-slate-800 transition-transform active:scale-95 z-40 flex items-center justify-center"
          >
            <Filter size={20} />
          </button>

          {/* Drawer Backdrop */}
          {isMobileSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Drawer Panel */}
          <div 
            className={`lg:hidden fixed top-0 right-0 h-full w-[340px] max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <span className="font-bold text-slate-700">Filters & Options</span>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto w-full bg-slate-50/30">
               {rightSidebar}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
}
