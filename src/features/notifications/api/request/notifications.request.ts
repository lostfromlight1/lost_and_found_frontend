import { NotificationType } from "../response/notifications.response";

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  type?: NotificationType;
}

export interface SaveFcmTokenRequest {
  fcmToken: string;
}
