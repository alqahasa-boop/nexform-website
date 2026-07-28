import { z } from "zod";

export const createRedirectSchema = z.object({
  fromPath: z.string().min(1).max(500).regex(/^\//, "Must start with /"),
  toPath: z.string().min(1).max(500),
  statusCode: z.coerce.number().int().refine((v) => [301, 302, 307, 308].includes(v), "Must be a valid redirect status code"),
});
export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
