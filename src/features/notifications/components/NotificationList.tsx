"use client";

import { useState } from "react";
import { useNotifications, useMarkAllAsRead } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Bell, Settings } from "lucide-react";
import { NotificationSummary } from "../api/response/notifications.response";
import MainLayout from "@/components/layout/MainLayout";
import NotificationRightSidebar, { FilterType } from "./NotificationRightSidebar";

export function NotificationList() {
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");
  const [filterUnread, setFilterUnread] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  
  const { data, isLoading } = useNotifications({ page: 0, size: 50 });
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  const notifications = data?.content || [];

  // --- Filter Logic ---
  const isCommentOrReply = (type: string) => ["COMMENT_CREATED", "REPLY_CREATED", "REPLY_TO_REPLY"].includes(type);
  const isReport = (type: string) => ["REPORT_SUBMITTED", "REPORT_RESOLVED", "REPORT_REJECTED"].includes(type);

  let displayNotifications = notifications;

  if (activeTab === "mentions") {
    displayNotifications = displayNotifications.filter((n: NotificationSummary) => n.type === "MENTION");
  } else {
    if (typeFilter === "LIKES") {
      displayNotifications = displayNotifications.filter((n: NotificationSummary) => n.type === "POST_LIKED");
    } else if (typeFilter === "COMMENTS") {
      displayNotifications = displayNotifications.filter((n: NotificationSummary) => isCommentOrReply(n.type));
    } else if (typeFilter === "REPORTS") {
      displayNotifications = displayNotifications.filter((n: NotificationSummary) => isReport(n.type));
    }
  }

  if (filterUnread) {
    displayNotifications = displayNotifications.filter((n: NotificationSummary) => n.status === "UNREAD");
  }

  const hasUnread = notifications.some((n: NotificationSummary) => n.status === "UNREAD");

  return (
    <MainLayout
      rightSidebar={
        <NotificationRightSidebar 
          filterUnread={filterUnread}
          setFilterUnread={setFilterUnread}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          activeTab={activeTab}
          hasUnread={hasUnread}
          markAllAsRead={markAllAsRead}
          isPending={isPending}
        />
      }
    >
      {/* Sticky Header & Tabs - Removed rounded borders */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-slate-100 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-900">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center cursor-pointer">
          <div 
            onClick={() => setActiveTab("all")} 
            className="flex-1 hover:bg-slate-50 transition-colors text-center font-bold text-[15px] pt-3 pb-3 relative"
          >
            <span className={activeTab === "all" ? "text-slate-900" : "text-slate-500 font-medium"}>All</span>
            {activeTab === "all" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-t-sm" />}
          </div>
          <div 
            onClick={() => setActiveTab("mentions")} 
            className="flex-1 hover:bg-slate-50 transition-colors text-center font-bold text-[15px] pt-3 pb-3 relative"
          >
            <span className={activeTab === "mentions" ? "text-slate-900" : "text-slate-500 font-medium"}>Mentions</span>
            {activeTab === "mentions" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#1d9bf0] rounded-t-sm" />}
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col pb-20 shrink-0 bg-white min-h-[70vh] border-x border-b border-slate-200">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading notifications...</div>
        ) : displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
               <Bell className="text-slate-300 w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Nothing to see here — yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              {activeTab === "mentions" 
                ? "When someone mentions you, it will show up here."
                : "When someone interacts with your posts or comments, you'll find it here."}
            </p>
          </div>
        ) : (
          displayNotifications.map((notif: NotificationSummary) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </MainLayout>
  );
}
