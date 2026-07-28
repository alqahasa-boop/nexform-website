import { z } from "zod";

export const createContactMessageSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000),
});
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;

export const updateContactMessageSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]).optional(),
  isRead: z.boolean().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;

export const replyToContactMessageSchema = z.object({
  contactMessageId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});
export type ReplyToContactMessageInput = z.infer<typeof replyToContactMessageSchema>;
