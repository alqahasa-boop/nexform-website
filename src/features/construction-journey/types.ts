import { z } from "zod";

export const createJourneyStageSchema = z.object({
  order: z.number().int().min(0),
  title: z.string().min(1).max(160),
  richContent: z.string().max(5000).optional(),
  language: z.string().default("en"),
  translationGroupId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});
export type CreateJourneyStageInput = z.infer<typeof createJourneyStageSchema>;

export const updateJourneyStageSchema = createJourneyStageSchema.partial().extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
});
export type UpdateJourneyStageInput = z.infer<typeof updateJourneyStageSchema>;
