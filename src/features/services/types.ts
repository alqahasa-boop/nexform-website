import { z } from "zod";

export const createServiceSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  language: z.string().default("en"),
  categoryId: z.string().uuid().optional(),
  coverImageId: z.string().uuid().optional(),
  pricingDisplay: z.enum(["HIDDEN", "FIXED", "STARTING_AT", "CONTACT_FOR_QUOTE"]).default("CONTACT_FOR_QUOTE"),
  price: z.coerce.number().positive().optional(),
  isRequestable: z.boolean().default(true),
  order: z.number().int().default(0),
  createdById: z.string().uuid(),
});
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial().omit({ createdById: true }).extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
});
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
