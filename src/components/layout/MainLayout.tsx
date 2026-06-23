"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function MainLayout({
  children,
  rightSidebar,
}: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full gap-0 lg:gap-6">
      <main className="min-w-0 flex-1">{children}</main>

      {rightSidebar && (
        <>
          <aside className="hidden shrink-0 lg:block lg:w-[320px] xl:w-[350px]">
            <div className="sticky top-5">{rightSidebar}</div>
          </aside>

          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#b7cfb2] bg-[#edf5eb] text-[#2a3f3f] shadow-[0_10px_24px_rgba(42,63,63,0.18)] transition active:scale-95 lg:hidden"
          >
            <Filter size={18} />
          </button>

          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 z-50 bg-[#1f2f2f]/30 backdrop-blur-[2px] lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <div
            className={`fixed right-0 top-0 z-50 h-full w-[92vw] max-w-[380px] border-l border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-out lg:hidden ${isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-sidebar-foreground/80">
                Filters
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-sidebar-foreground transition hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[calc(100%-73px)] overflow-y-auto px-4 py-4">
              {rightSidebar}
            </div>
          </div>
        </>
      )}
    </div>
  );
}