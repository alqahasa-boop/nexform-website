import { z } from "zod";

export const categoryTypeSchema = z.enum(["ARTICLE", "PROJECT", "DESIGN_IDEA"]);

export const createCategorySchema = z.object({
  type: categoryTypeSchema,
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
  parentId: z.string().uuid().optional(),
  order: z.number().int().default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
