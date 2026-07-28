"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { setLanguageActive, setDefaultLanguage } from "./languages.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function toggleLanguageActiveAction(code: string, isActive: boolean): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("languages:manage");

    if (!isActive) {
      // The default language must always stay active — the public site needs a fallback locale.
      const language = await db.language.findUnique({ where: { code }, select: { isDefault: true } });
      if (language?.isDefault) return apiError("Cannot disable the default language.", "DEFAULT_LANGUAGE");
    }

    await setLanguageActive(code, isActive);
    await recordActivity({ userId: user.id, action: "SETTINGS_CHANGE", entityType: "Language", entityId: code, metadata: { isActive } });
    revalidatePath("/admin/languages");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function setDefaultLanguageAction(code: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("languages:manage");
    await setDefaultLanguage(code);
    await recordActivity({ userId: user.id, action: "SETTINGS_CHANGE", entityType: "Language", entityId: code, metadata: { setDefault: true } });
    revalidatePath("/admin/languages");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
