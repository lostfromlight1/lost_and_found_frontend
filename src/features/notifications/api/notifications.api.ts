import { api as apiClient } from "@/lib/api/axios";
import { BaseResponse, PaginatedResponse } from "@/types/api.types";
import { GetNotificationsParams, SaveFcmTokenRequest } from "./request/notifications.request";
import { 
  NotificationSummary, 
  NotificationDto, 
  UnreadCountDto, 
  NotificationActionResponse, 
  FcmTokenResponse 
} from "./response/notifications.response";

const BASE_URL = "/notifications";

export const getNotificationsApi = async (params: GetNotificationsParams): Promise<PaginatedResponse<NotificationSummary>> => {
  const response = await apiClient.get<BaseResponse<PaginatedResponse<NotificationSummary>>>(BASE_URL, { params });
  return response as unknown as PaginatedResponse<NotificationSummary>;
};

export const getNotificationsByTypeApi = async (type: string, params: GetNotificationsParams): Promise<PaginatedResponse<NotificationSummary>> => {
  const response = await apiClient.get<BaseResponse<PaginatedResponse<NotificationSummary>>>(`${BASE_URL}/type/${type}`, { params });
  return response as unknown as PaginatedResponse<NotificationSummary>;
};

export const getUnreadCountApi = async (): Promise<UnreadCountDto> => {
  const response = await apiClient.get<BaseResponse<UnreadCountDto>>(`${BASE_URL}/unread/count`);
  return response as unknown as UnreadCountDto;
};

export const getUnreadNotificationsApi = async (): Promise<NotificationDto[]> => {
  const response = await apiClient.get<BaseResponse<NotificationDto[]>>(`${BASE_URL}/unread`);
  return response as unknown as NotificationDto[];
};

export const markAsReadApi = async (notificationId: number): Promise<NotificationActionResponse> => {
  const response = await apiClient.put<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/${notificationId}/read`);
  return response as unknown as NotificationActionResponse;
};

export const markAllAsReadApi = async (): Promise<NotificationActionResponse> => {
  const response = await apiClient.put<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/read-all`);
  return response as unknown as NotificationActionResponse;
};

export const deleteNotificationApi = async (notificationId: number): Promise<NotificationActionResponse> => {
  const response = await apiClient.delete<BaseResponse<NotificationActionResponse>>(`${BASE_URL}/${notificationId}`);
  return response as unknown as NotificationActionResponse;
};

export const saveFcmTokenApi = async (data: SaveFcmTokenRequest): Promise<FcmTokenResponse> => {
  const response = await apiClient.post<BaseResponse<FcmTokenResponse>>(`${BASE_URL}/fcm-token`, data);
  return response as unknown as FcmTokenResponse;
};
