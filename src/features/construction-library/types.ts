import { z } from "zod";

export const createLibraryCategorySchema = z.object({
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160),
  description: z.string().max(500).optional(),
  order: z.number().int().default(0),
  language: z.string().default("en"),
});
export type CreateLibraryCategoryInput = z.infer<typeof createLibraryCategorySchema>;
export const updateLibraryCategorySchema = createLibraryCategorySchema.partial();
export type UpdateLibraryCategoryInput = z.infer<typeof updateLibraryCategorySchema>;

export const createLibraryItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  documentType: z
    .enum(["GOVERNMENT", "BANK_FINANCE", "PDF_GUIDE", "ENGINEERING_MANUAL", "CHECKLIST", "FORM", "REGULATION", "OTHER"])
    .default("OTHER"),
  language: z.string().default("en"),
  categoryId: z.string().uuid(),
  fileId: z.string().uuid().optional(),
  sourceOrganization: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional(),
});
export type CreateLibraryItemInput = z.infer<typeof createLibraryItemSchema>;
export const updateLibraryItemSchema = createLibraryItemSchema.partial().omit({ categoryId: true }).extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  isVerified: z.boolean().optional(),
});
export type UpdateLibraryItemInput = z.infer<typeof updateLibraryItemSchema>;
