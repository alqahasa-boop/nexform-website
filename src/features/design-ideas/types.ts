import { z } from "zod";

export const designCategorySchema = z.enum(["GENERAL", "FACADE", "INTERIOR", "COMMERCIAL_BOOTH"]);

export const createDesignIdeaSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  designCategory: designCategorySchema.default("GENERAL"),
  language: z.string().default("en"),
  translationGroupId: z.string().uuid().optional(),
  roomType: z.string().max(80).optional(),
  areaSqm: z.coerce.number().positive().optional(),
  dimensions: z.record(z.string(), z.unknown()).optional(),
  floorCount: z.number().int().positive().optional(),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  designerId: z.string().uuid().optional(),
  designerName: z.string().max(160).optional(),
  categoryId: z.string().uuid().optional(),
  coverImageId: z.string().uuid().optional(),
  styleIds: z.array(z.string().uuid()).optional(),
});
export type CreateDesignIdeaInput = z.infer<typeof createDesignIdeaSchema>;

export const updateDesignIdeaSchema = createDesignIdeaSchema.partial().extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  featured: z.boolean().optional(),
});
export type UpdateDesignIdeaInput = z.infer<typeof updateDesignIdeaSchema>;
