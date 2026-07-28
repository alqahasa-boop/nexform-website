"use server";

import { consumePasswordResetToken } from "@/lib/auth/tokens";
import { isPasswordStrongEnough } from "@/lib/auth/password";
import { updateUserPassword, revokeUserSessions } from "@/features/users/users.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function setNewPasswordAction(token: string, newPassword: string): Promise<ApiResult<null>> {
  if (!isPasswordStrongEnough(newPassword)) {
    return apiError("Password must be at least 8 characters and include both a letter and a number.", "WEAK_PASSWORD");
  }

  // Generic error on every failure path — never reveal whether a token existed vs. expired.
  const record = await consumePasswordResetToken(token);
  if (!record) return apiError("This link is invalid or has expired. Request a new one.", "INVALID_TOKEN");

  await updateUserPassword(record.userId, newPassword);
  await revokeUserSessions(record.userId);
  await recordActivity({ userId: record.userId, action: "UPDATE", entityType: "User", entityId: record.userId, metadata: { passwordReset: true } });

  return apiSuccess(null);
}
