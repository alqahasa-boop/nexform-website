"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { generateTotpSecret, verifyTotpCode, buildTotpProvisioningUri } from "@/lib/auth/totp";
import { generateBackupCodes, hashBackupCodes } from "@/lib/auth/backup-codes";
import { verifyPassword } from "@/lib/auth/password";
import { getTwoFactorState, setPendingTwoFactorSecret, activateTwoFactor, disableTwoFactor } from "./two-factor.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function startTwoFactorSetupAction(): Promise<ApiResult<{ secret: string; otpauthUri: string }>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  const secret = generateTotpSecret();
  await setPendingTwoFactorSecret(user.id, secret);

  return apiSuccess({ secret, otpauthUri: buildTotpProvisioningUri(secret, user.email) });
}

export async function confirmTwoFactorSetupAction(code: string): Promise<ApiResult<{ backupCodes: string[] }>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  const state = await getTwoFactorState(user.id);
  if (!state?.twoFactorSecret) return apiError("Start 2FA setup first.", "NOT_STARTED");

  if (!verifyTotpCode(state.twoFactorSecret, code)) {
    return apiError("That code is invalid or has expired. Check your authenticator app and try again.", "INVALID_CODE");
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = await hashBackupCodes(backupCodes);
  await activateTwoFactor(user.id, hashedCodes);
  await recordActivity({ userId: user.id, action: "SETTINGS_CHANGE", entityType: "User", entityId: user.id, metadata: { twoFactorEnabled: true } });

  return apiSuccess({ backupCodes });
}

export async function disableTwoFactorAction(currentPassword: string): Promise<ApiResult<null>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  const state = await getTwoFactorState(user.id);
  if (!state?.passwordHash || !(await verifyPassword(currentPassword, state.passwordHash))) {
    return apiError("Incorrect password.", "INVALID_PASSWORD");
  }

  await disableTwoFactor(user.id);
  await recordActivity({ userId: user.id, action: "SETTINGS_CHANGE", entityType: "User", entityId: user.id, metadata: { twoFactorEnabled: false } });
  return apiSuccess(null);
}

export async function getTwoFactorStatusAction(): Promise<ApiResult<{ enabled: boolean }>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");

  const state = await getTwoFactorState(user.id);
  return apiSuccess({ enabled: state?.twoFactorEnabled ?? false });
}
