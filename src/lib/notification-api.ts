import { request } from "@/lib/api";
import type { NotificationPage } from "@/types/notification";

export const notificationsChangedEvent = "jobboard:notifications-changed";

export function getNotifications(page: number, unreadOnly: boolean, accessToken: string) {
  return request<NotificationPage>(
    `/notifications?page=${page}&pageSize=20&unreadOnly=${unreadOnly}`,
    undefined,
    accessToken,
  );
}

export function getUnreadCount(accessToken?: string, signal?: AbortSignal) {
  return request<{ count: number }>("/notifications/unread-count", { signal }, accessToken);
}

export const markNotificationRead = (id: number) =>
  request<void>(`/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsRead = () =>
  request<void>("/notifications/read-all", { method: "PATCH" });
