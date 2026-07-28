import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["SYSTEM", "DESIGN_REQUEST", "CONTACT_MESSAGE", "CONTENT", "SECURITY"]),
  title: z.string().min(1).max(200),
  body: z.string().max(1000).optional(),
  link: z.string().max(500).optional(),
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
