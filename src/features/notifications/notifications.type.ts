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

export type NotificationQueryParams = {
    page?: number;
    size?: number;
    type?: NotificationType;
};

export type SaveFcmTokenRequest = {
    fcmToken: string;
};

export type NotificationSummary = {
    id: number;
    userName: string;
    userAvatarUrl?: string | null;
    type: NotificationType;
    status: NotificationStatus;
    title: string;
    createdAt: string;
};

export type Notification = NotificationSummary & {
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
};

export type UnreadCount = {
    unreadCount: number;
};

export type FcmTokenSaveResult = {
    saved: boolean;
    message: string;
};

export type NotificationActionResult = {
    success: boolean;
    message: string;
    notificationId?: number | null;
};

export const DEFAULT_NOTIFICATION_PAGE = 0;
export const DEFAULT_NOTIFICATION_PAGE_SIZE = 50;

export const DEFAULT_NOTIFICATION_QUERY_PARAMS: NotificationQueryParams = {
    page: DEFAULT_NOTIFICATION_PAGE,
    size: DEFAULT_NOTIFICATION_PAGE_SIZE,
};

export const COMMENT_NOTIFICATION_TYPES: readonly NotificationType[] = [
    NotificationType.COMMENT_CREATED,
    NotificationType.REPLY_CREATED,
    NotificationType.REPLY_TO_REPLY,
];

export const REPORT_NOTIFICATION_TYPES: readonly NotificationType[] = [
    NotificationType.REPORT_SUBMITTED,
    NotificationType.REPORT_RESOLVED,
    NotificationType.REPORT_REJECTED,
];