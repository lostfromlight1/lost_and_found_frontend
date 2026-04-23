"use client";

import { useNotifications, useMarkAllAsRead } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Bell } from "lucide-react";
import { NotificationSummary } from "../api/response/notifications.response";

export function NotificationList() {
  const { data, isLoading } = useNotifications({ page: 0, size: 50 });
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  const notifications = data?.content || [];
  // Typed 'n' to NotificationSummary
  const hasUnread = notifications.some((n: NotificationSummary) => n.status === "UNREAD");

  if (isLoading) {
    return <div className="text-center py-20 text-slate-400 font-medium">Loading notifications...</div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100 bg-white sticky top-0 z-10">
        <h2 className="font-black text-[15px] uppercase tracking-widest text-slate-900">
          All Activity
        </h2>
        {hasUnread && (
          <button 
            onClick={() => markAllAsRead()}
            disabled={isPending}
            className="text-[13px] font-bold text-[#1d9bf0] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
               <Bell className="text-slate-300 w-8 h-8" />
            </div>
            {/* Escaped the quote */}
            <h3 className="font-bold text-slate-900 text-lg">You&apos;re all caught up</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              {/* Escaped the quote */}
              When someone likes or comments on your posts, you&apos;ll see it here.
            </p>
          </div>
        ) : (
          // Typed 'notif' to NotificationSummary
          notifications.map((notif: NotificationSummary) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </div>
  );
}
