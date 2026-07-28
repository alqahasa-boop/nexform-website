import { z } from "zod";

export const designRequestStatusSchema = z.enum([
  "NEW",
  "UNDER_REVIEW",
  "WAITING_FOR_CUSTOMER_INFO",
  "ACCEPTED",
  "IN_PROGRESS",
  "DRAFT_READY",
  "REVISION_REQUESTED",
  "FINAL_READY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
]);

export const createDesignRequestSchema = z.object({
  fullName: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  customerId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  propertyType: z.string().max(120).optional(),
  roomType: z.string().max(120).optional(),
  measurements: z.record(z.string(), z.unknown()).optional(),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  notes: z.string().max(4000).optional(),
  preferredStyleIds: z.array(z.string().uuid()).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});
export type CreateDesignRequestInput = z.infer<typeof createDesignRequestSchema>;

export const updateDesignRequestSchema = z.object({
  status: designRequestStatusSchema.optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid().nullable().optional(),
  notes: z.string().max(4000).optional(),
});
export type UpdateDesignRequestInput = z.infer<typeof updateDesignRequestSchema>;

export const addDesignRequestMessageSchema = z.object({
  designRequestId: z.string().uuid(),
  authorId: z.string().uuid().optional(),
  authorName: z.string().max(160).optional(),
  body: z.string().min(1).max(4000),
  isInternal: z.boolean().default(false),
});
export type AddDesignRequestMessageInput = z.infer<typeof addDesignRequestMessageSchema>;
