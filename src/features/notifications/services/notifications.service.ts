import * as api from "../api/notifications.api";
import { GetNotificationsParams, SaveFcmTokenRequest } from "../api/request/notifications.request";

export const getNotificationsService = async (params: GetNotificationsParams) => {
  const res = await api.getNotificationsApi(params);
  return res.data;
};

export const getUnreadCountService = async () => {
  const res = await api.getUnreadCountApi();
  return res.data;
};

export const markAsReadService = async (id: number) => {
  const res = await api.markAsReadApi(id);
  return res.data;
};

export const markAllAsReadService = async () => {
  const res = await api.markAllAsReadApi();
  return res.data;
};

export const deleteNotificationService = async (id: number) => {
  const res = await api.deleteNotificationApi(id);
  return res.data;
};

export const saveFcmTokenService = async (data: SaveFcmTokenRequest) => {
  const res = await api.saveFcmTokenApi(data);
  return res.data;
};
