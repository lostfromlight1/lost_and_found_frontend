import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getNotificationsService,
  getNotificationsByTypeService,
  getUnreadCountService,
  getUnreadNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
  saveFcmTokenService
} from "../services/notifications.service";
import { GetNotificationsParams } from "../api/request/notifications.request";

export const useNotifications = (params: GetNotificationsParams) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotificationsService(params),
  });
};

export const useNotificationsByType = (type: string, params: GetNotificationsParams) => {
  return useQuery({
    queryKey: ["notifications", type, params],
    queryFn: () => getNotificationsByTypeService(type, params),
    enabled: !!type,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => getUnreadCountService(),
    refetchInterval: 30000, // Poll every 30s
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadNotificationsService(),
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markAsReadService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsReadService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      toast.success("All notifications marked as read");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotificationService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      toast.success("Notification deleted");
    },
  });
};

export const useSaveFcmToken = () => {
  return useMutation({
    mutationFn: (fcmToken: string) => saveFcmTokenService({ fcmToken }),
    onSuccess: () => {
      console.log("FCM token synced successfully");
    },
    onError: (error) => {
      console.error("Failed to sync FCM token:", error);
    }
  });
};
