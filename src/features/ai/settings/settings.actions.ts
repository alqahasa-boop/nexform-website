"use server";

import { revalidatePath } from "next/cache";
import type { AiModuleKey } from "@/generated/prisma/client";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { getConfiguredProviderSummary } from "@/lib/ai/orchestrator";
import { getEnabledModules, listModuleSettings, setModuleEnabled } from "./settings.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

/** Public — the widget needs this before it can decide what to show, no permission required. */
export async function getAiPublicStatusAction(): Promise<ApiResult<{ configured: boolean; enabledModules: AiModuleKey[] }>> {
  const [{ configured }, enabledModules] = await Promise.all([
    Promise.resolve(getConfiguredProviderSummary()),
    getEnabledModules(),
  ]);
  return apiSuccess({ configured, enabledModules });
}

export async function listModuleSettingsAction(): Promise<ApiResult<Awaited<ReturnType<typeof listModuleSettings>>>> {
  try {
    await assertPermission("ai:view");
    const settings = await listModuleSettings();
    return apiSuccess(settings);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function toggleModuleAction(module: AiModuleKey, isEnabled: boolean): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("ai:manage");
    await setModuleEnabled(module, isEnabled);
    await recordActivity({
      userId: user.id,
      action: "SETTINGS_CHANGE",
      entityType: "AiModuleSetting",
      entityId: module,
      metadata: { isEnabled },
    });
    revalidatePath("/admin/ai");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
