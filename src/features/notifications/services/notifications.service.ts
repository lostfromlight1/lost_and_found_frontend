import * as api from "../api/notifications.api";
import { GetNotificationsParams, SaveFcmTokenRequest } from "../api/request/notifications.request";

export const getNotificationsService = async (params: GetNotificationsParams) => {
  return await api.getNotificationsApi(params);
};

export const getNotificationsByTypeService = async (type: string, params: GetNotificationsParams) => {
  return await api.getNotificationsByTypeApi(type, params);
};

export const getUnreadCountService = async () => {
  return await api.getUnreadCountApi();
};

export const getUnreadNotificationsService = async () => {
  return await api.getUnreadNotificationsApi();
};

export const markAsReadService = async (id: number) => {
  return await api.markAsReadApi(id);
};

export const markAllAsReadService = async () => {
  return await api.markAllAsReadApi();
};

export const deleteNotificationService = async (id: number) => {
  return await api.deleteNotificationApi(id);
};

export const saveFcmTokenService = async (data: SaveFcmTokenRequest) => {
  return await api.saveFcmTokenApi(data);
};
