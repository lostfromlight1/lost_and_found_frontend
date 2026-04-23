export enum NotificationType {
  COMMENT_CREATED = "COMMENT_CREATED",
  REPLY_CREATED = "REPLY_CREATED",
  REPLY_TO_REPLY = "REPLY_TO_REPLY",
  POST_LIKED = "POST_LIKED",
  MENTION = "MENTION",
  POST_STATUS_CHANGED = "POST_STATUS_CHANGED",
  REPORT_SUBMITTED = "REPORT_SUBMITTED",
  REPORT_RESOLVED = "REPORT_RESOLVED",
  REPORT_REJECTED = "REPORT_REJECTED",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export interface NotificationSummary {
  id: number;
  userName: string;
  userAvatarUrl?: string | null;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  createdAt: string;
}

export interface NotificationDto extends NotificationSummary {
  userId: number;
  recipientId: number;
  fcmToken?: string | null;
  message?: string | null;
  postId?: number | null;
  commentId?: number | null;
  replyId?: number | null;
  pushSent: boolean;
  readAt?: string | null;
  updatedAt?: string | null;
}

export interface UnreadCountDto {
  unreadCount: number;
}

export interface FcmTokenResponse {
  saved: boolean;
  message: string;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
  notificationId?: number | null;
}
