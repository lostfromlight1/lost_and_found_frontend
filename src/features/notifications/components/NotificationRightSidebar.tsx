"use client";

import { Filter, CheckCircle2 } from "lucide-react";

export type FilterType = "ALL" | "LIKES" | "COMMENTS" | "REPORTS";

interface NotificationRightSidebarProps {
  filterUnread: boolean;
  setFilterUnread: (val: boolean) => void;
  typeFilter: FilterType;
  setTypeFilter: (val: FilterType) => void;
  activeTab: "all" | "mentions";
  hasUnread: boolean;
  markAllAsRead: () => void;
  isPending: boolean;
}

export default function NotificationRightSidebar({
  filterUnread,
  setFilterUnread,
  typeFilter,
  setTypeFilter,
  activeTab,
  hasUnread,
  markAllAsRead,
  isPending,
}: NotificationRightSidebarProps) {
  return (
    // FIX: Changed xl:w-[350px] to xl:w-87.5 to resolve the ESLint warning
    <div className="flex flex-col w-full lg:w-[320px] xl:w-87.5 h-full pt-8 pb-6 px-6 xl:px-8 border-l border-transparent lg:border-slate-200 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* This inner box matches the PostFeed's filter box EXACTLY */}
      <div className="mb-10 shrink-0 bg-white border border-slate-200 rounded-lg p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-[13px] text-slate-900 uppercase tracking-widest flex items-center gap-2">
            {/* FIX: Added the Filter icon back */}
            <Filter size={15} className="text-slate-500" />
            Filter Feed
          </h2>
          {hasUnread && (
            <button 
              onClick={() => markAllAsRead()}
              disabled={isPending}
              className="flex items-center gap-1 text-[11px] text-[#1d9bf0] hover:text-[#1a8cd8] font-bold transition-colors group"
              title="Mark all as read"
            >
              {/* FIX: Added the CheckCircle2 icon back alongside the text */}
              <CheckCircle2 size={14} strokeWidth={2.5} />
              <span className="underline underline-offset-2 group-hover:no-underline">Mark all as read</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Unread Toggle */}
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">
              Unread only
            </span>
            <input 
              type="checkbox" 
              checked={filterUnread} 
              onChange={(e) => setFilterUnread(e.target.checked)} 
              className="w-4 h-4 accent-[#1d9bf0] cursor-pointer rounded-none border-slate-300" 
            />
          </label>

          <hr className="border-slate-100" />

          {/* Type Radio Group */}
          <div className={`flex flex-col gap-2 ${activeTab === "mentions" ? "opacity-40 pointer-events-none" : ""}`}>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter mb-2">
              Post Type
            </span>
            
            <div className="flex flex-col gap-4">
              {[
                { id: "ALL", label: "All Types" },
                { id: "LIKES", label: "Likes" },
                { id: "COMMENTS", label: "Comments & Replies" },
                { id: "REPORTS", label: "Reports & System" },
              ].map((type) => (
                <label key={type.id} className="flex items-center justify-between cursor-pointer group">
                  <span className={`text-[13px] transition-colors ${typeFilter === type.id ? "font-bold text-slate-900" : "font-medium text-slate-600 group-hover:text-slate-900"}`}>
                    {type.label}
                  </span>
                  <input 
                    type="radio" 
                    name="typeFilter" 
                    value={type.id}
                    checked={typeFilter === type.id} 
                    onChange={(e) => setTypeFilter(e.target.value as FilterType)} 
                    className="w-4 h-4 accent-[#1d9bf0] cursor-pointer" 
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
