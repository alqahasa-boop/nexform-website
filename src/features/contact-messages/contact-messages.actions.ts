"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import {
  updateContactMessage,
  replyToContactMessage,
  archiveContactMessage,
  deleteContactMessage,
} from "./contact-messages.repository";
import { replyToContactMessageSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { sendEmail } from "@/services/email.service";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function markContactMessageStatusAction(id: string, status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED"): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("contactMessages:update");
    await updateContactMessage(id, { status, isRead: true });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "ContactMessage", entityId: id, metadata: { status } });
    revalidatePath("/admin/contact-messages");
    revalidatePath(`/admin/contact-messages/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function assignContactMessageAction(id: string, assignedToId: string | null): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("contactMessages:manage");
    await updateContactMessage(id, { assignedToId });
    await recordActivity({ userId: user.id, action: "ASSIGN", entityType: "ContactMessage", entityId: id, metadata: { assignedToId } });
    revalidatePath(`/admin/contact-messages/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function replyToContactMessageAction(input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("contactMessages:update");
    const parsed = replyToContactMessageSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const message = await db.contactMessage.findUnique({ where: { id: parsed.data.contactMessageId }, select: { email: true, name: true } });
    if (!message) return apiError("Message not found.", "NOT_FOUND");

    await replyToContactMessage(parsed.data.contactMessageId, user.id, parsed.data.body);
    await sendEmail({
      to: message.email,
      subject: "Re: Your message to NEXFORM",
      html: `<p>Hi ${message.name},</p><p>${parsed.data.body}</p>`,
    });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "ContactMessage", entityId: parsed.data.contactMessageId, metadata: { replied: true } });
    revalidatePath(`/admin/contact-messages/${parsed.data.contactMessageId}`);

    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function archiveContactMessageAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("contactMessages:update");
    await archiveContactMessage(id);
    await recordActivity({ userId: user.id, action: "ARCHIVE", entityType: "ContactMessage", entityId: id });
    revalidatePath("/admin/contact-messages");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteContactMessageAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("contactMessages:manage");
    await deleteContactMessage(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "ContactMessage", entityId: id });
    revalidatePath("/admin/contact-messages");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
