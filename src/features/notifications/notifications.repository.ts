import { db } from "@/lib/db";
import type { CreateNotificationInput } from "./types";

export function listNotifications(userId: string, unreadOnly = false) {
  return db.notification.findMany({
    where: { userId, ...(unreadOnly && { isRead: false }) },
    orderBy: { createdAt: "desc" },
  });
}

export function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, isRead: false } });
}

export function createNotification(input: CreateNotificationInput) {
  return db.notification.create({ data: input });
}

export function markNotificationRead(id: string) {
  return db.notification.update({ where: { id }, data: { isRead: true } });
}

export function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
