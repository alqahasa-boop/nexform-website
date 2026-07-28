import { z } from "zod";

export const createPlacementSchema = z.object({
  key: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160),
  description: z.string().max(500).optional(),
  pageContext: z.string().max(120).optional(),
  recommendedWidth: z.number().int().positive().optional(),
  recommendedHeight: z.number().int().positive().optional(),
});
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;

export const createPackageSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(500).optional(),
  durationDays: z.number().int().positive().optional(),
  price: z.coerce.number().positive().optional(),
  maxPlacements: z.number().int().positive().optional(),
});
export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  companyId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  priority: z.number().int().default(0),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  billingReferenceId: z.string().optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = createCampaignSchema.partial().omit({ companyId: true }).extend({
  status: z
    .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "ACTIVE", "PAUSED", "EXPIRED", "REJECTED", "CANCELLED"])
    .optional(),
});
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const createCreativeSchema = z.object({
  campaignId: z.string().uuid(),
  title: z.string().min(1).max(200),
  imageId: z.string().uuid().optional(),
  targetUrl: z.string().url().optional(),
  whatsappNumber: z.string().optional(),
  callToAction: z.string().max(60).optional(),
});
export type CreateCreativeInput = z.infer<typeof createCreativeSchema>;

export const DEVICE_TARGETS = ["desktop", "mobile", "tablet"] as const;

export const assignCreativeToPlacementSchema = z.object({
  campaignId: z.string().uuid(),
  placementId: z.string().uuid(),
  creativeId: z.string().uuid(),
  deviceTargeting: z.array(z.enum(DEVICE_TARGETS)).default([]),
});
export type AssignCreativeToPlacementInput = z.infer<typeof assignCreativeToPlacementSchema>;
