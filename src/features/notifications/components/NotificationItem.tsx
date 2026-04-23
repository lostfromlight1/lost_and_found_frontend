"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, ShieldAlert, AtSign, Trash2, CheckCircle2, Bell } from "lucide-react";
import { NotificationSummary, NotificationStatus, NotificationType } from "../api/response/notifications.response";
import { useDeleteNotification, useMarkAsRead } from "../hooks/useNotifications";

interface NotificationItemProps {
  notification: NotificationSummary;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.POST_LIKED:
      return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
    case NotificationType.COMMENT_CREATED:
    case NotificationType.REPLY_CREATED:
    case NotificationType.REPLY_TO_REPLY:
      return <MessageCircle className="w-4 h-4 text-[#1d9bf0]" />;
    case NotificationType.MENTION:
      return <AtSign className="w-4 h-4 text-emerald-500" />;
    case NotificationType.REPORT_SUBMITTED:
    case NotificationType.REPORT_RESOLVED:
    case NotificationType.REPORT_REJECTED:
      return <ShieldAlert className="w-4 h-4 text-amber-500" />;
    default:
      return <Bell className="w-4 h-4 text-slate-500" />;
  }
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const isUnread = notification.status === NotificationStatus.UNREAD;
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteNotif, isPending: isDeleting } = useDeleteNotification();

  const handleRead = () => {
    if (isUnread) markAsRead(notification.id);
  };

  return (
    <div 
      onClick={handleRead}
      className={`group flex items-start gap-4 p-4 md:p-6 border-b border-slate-100 transition-colors cursor-pointer ${
        isUnread ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/30"
      }`}
    >
      <div className="relative shrink-0 mt-1">
        <Avatar className="w-12 h-12 border border-slate-200">
          <AvatarImage src={notification.userAvatarUrl || undefined} />
          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
            {notification.userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          {getIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[15px] text-slate-900 leading-snug pr-4">
             {notification.title}
          </p>
          <span className="shrink-0 text-[13px] text-slate-400 font-medium whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex gap-3">
             {isUnread && (
               <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#1d9bf0]">
                 <div className="w-2 h-2 rounded-full bg-[#1d9bf0]" />
                 New
               </div>
             )}
           </div>
           
           <div className="flex gap-2">
             {isUnread && (
               <button 
                 onClick={(e) => { e.stopPropagation(); handleRead(); }}
                 className="p-2 text-slate-400 hover:text-[#1d9bf0] transition-colors rounded-full hover:bg-blue-50"
                 title="Mark as read"
               >
                 <CheckCircle2 size={16} />
               </button>
             )}
             <button 
               onClick={(e) => { e.stopPropagation(); deleteNotif(notification.id); }}
               disabled={isDeleting}
               className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
               title="Delete"
             >
               <Trash2 size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
