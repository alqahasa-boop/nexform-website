import { z } from "zod";

export const logActivitySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
    "RESTORE",
    "LOGIN",
    "LOGIN_FAILED",
    "LOGOUT",
    "PUBLISH",
    "ARCHIVE",
    "UPLOAD",
    "DOWNLOAD",
    "APPROVE",
    "REJECT",
    "ASSIGN",
    "PERMISSION_CHANGE",
    "SETTINGS_CHANGE",
  ]),
  entityType: z.string().min(1).max(80),
  entityId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().max(64).optional(),
  userAgent: z.string().max(300).optional(),
});
export type LogActivityInput = z.infer<typeof logActivitySchema>;
