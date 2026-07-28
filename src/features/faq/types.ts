import { z } from "zod";

export const createFaqItemSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1),
  category: z.string().max(120).optional(),
  order: z.number().int().default(0),
  language: z.string().default("en"),
  isPublished: z.boolean().default(false),
});
export type CreateFaqItemInput = z.infer<typeof createFaqItemSchema>;

export const updateFaqItemSchema = createFaqItemSchema.partial();
export type UpdateFaqItemInput = z.infer<typeof updateFaqItemSchema>;
