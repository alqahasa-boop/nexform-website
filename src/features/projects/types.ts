import { z } from "zod";

export const createProjectSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  description: z.string().optional(),
  language: z.string().default("en"),
  translationGroupId: z.string().uuid().optional(),
  projectType: z.string().max(120).optional(),
  location: z.string().max(200).optional(),
  areaSqm: z.coerce.number().positive().optional(),
  completionDate: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
  coverImageId: z.string().uuid().optional(),
  createdById: z.string().uuid(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().omit({ createdById: true }).extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const galleryItemSchema = z.object({
  mediaAssetId: z.string().uuid(),
  order: z.number().int().default(0),
});
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
