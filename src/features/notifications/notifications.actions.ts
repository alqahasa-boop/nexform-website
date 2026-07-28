"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin-session";
import { markNotificationRead, markAllNotificationsRead } from "./notifications.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function markNotificationReadAction(notificationId: string): Promise<ApiResult<null>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  // IDOR guard: a notification can only be marked read by the user it belongs to.
  const notification = await db.notification.findUnique({ where: { id: notificationId }, select: { userId: true } });
  if (!notification || notification.userId !== user.id) {
    return apiError("Notification not found.", "NOT_FOUND");
  }

  await markNotificationRead(notificationId);
  revalidatePath("/admin", "layout");
  return apiSuccess(null);
}

export async function markAllNotificationsReadAction(): Promise<ApiResult<null>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  await markAllNotificationsRead(user.id);
  revalidatePath("/admin", "layout");
  return apiSuccess(null);
}
