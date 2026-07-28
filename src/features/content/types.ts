import { z } from "zod";

export const createContentSchema = z.object({
  contentType: z.enum(["ARTICLE", "PAGE"]).default("ARTICLE"),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1),
  language: z.string().default("en"),
  translationGroupId: z.string().uuid().optional(), // set to link this row to its sibling-language version
  categoryId: z.string().uuid().optional(),
  coverImageId: z.string().uuid().optional(),
  authorId: z.string().uuid(),
});
export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = createContentSchema.partial().omit({ authorId: true }).extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  updatedById: z.string().uuid().optional(),
});
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
