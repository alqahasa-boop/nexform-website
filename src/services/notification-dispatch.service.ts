import { createNotification } from "@/features/notifications/notifications.repository";
import type { CreateNotificationInput } from "@/features/notifications/types";

/**
 * Single entry point for raising a notification. Today this only writes the
 * DB row the in-app bell reads. Phase 2 can extend this to also push through
 * email/websocket without every caller (design-request handlers, content
 * publish hooks, ...) needing to change.
 */
export async function dispatchNotification(input: CreateNotificationInput) {
  return createNotification(input);
}

export async function notifyNewDesignRequest(userId: string, requestId: string, fullName: string) {
  return dispatchNotification({
    userId,
    type: "DESIGN_REQUEST",
    title: "New design request",
    body: `${fullName} submitted a new design request.`,
    link: `/admin/design-requests/${requestId}`,
  });
}

export async function notifyNewContactMessage(userId: string, messageId: string, name: string) {
  return dispatchNotification({
    userId,
    type: "CONTACT_MESSAGE",
    title: "New contact message",
    body: `${name} sent a message through the contact form.`,
    link: `/admin/contact-messages/${messageId}`,
  });
}
