import { api as api } from "@/lib/api/axios";
import { BaseResponse, PaginatedResponse } from "@/types/api.types";
import { GetNotificationsParams, SaveFcmTokenRequest } from "./request/notifications.request";
import { NotificationSummary, NotificationDto, UnreadCountDto, NotificationActionResponse, FcmTokenResponse } from "./response/notifications.response";

const BASE_URL = "/notifications";

export const getNotificationsApi = async (params: GetNotificationsParams) => {
  const response = await api.get<BaseResponse<PaginatedResponse<NotificationSummary>>>(BASE_URL, { params });
  return response.data;
};

export const getNotificationsByTypeApi = async (type: string, params: GetNotificationsParams) => {
  const response = await api.get<BaseResponse<PaginatedResponse<NotificationSummary>>>(`${BASE_URL}/type/${type}`, { params });
  return response.data;
};

export const getUnreadCountApi = async () => {
  const response = await api.get<BaseResponse<UnreadCountDto>>(`${BASE_URL}/unread/count`);
  return response.data;
};

export const getUnreadNotificationsApi = async () => {
  const response = await api.get<BaseResponse<NotificationDto[]>>(`${BASE_URL}/unread`);
  return response.data;
};

export const markAsReadApi = async (notificationId: number) => {
  const response = await api.put<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/${notificationId}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await api.put<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/read-all`);
  return response.data;
};

export const deleteNotificationApi = async (notificationId: number) => {
  const response = await api.delete<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/${notificationId}`);
  return response.data;
};

export const saveFcmTokenApi = async (data: SaveFcmTokenRequest) => {
  const response = await api.post<BaseResponse<FcmTokenResponse>>(`${BASE_URL}/fcm-token`, data);
  return response.data;
};
