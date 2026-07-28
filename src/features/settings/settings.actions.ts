"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { setSetting } from "./settings.repository";
import { SETTING_KEYS } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export interface GeneralSettingsInput {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  maintenanceMode: boolean;
}

export async function updateGeneralSettingsAction(input: GeneralSettingsInput): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("settings:manage");

    await Promise.all([
      setSetting({ key: SETTING_KEYS.siteName, value: input.siteName, group: "general" }),
      setSetting({ key: SETTING_KEYS.contactEmail, value: input.contactEmail, group: "contact" }),
      setSetting({ key: SETTING_KEYS.contactPhone, value: input.contactPhone, group: "contact" }),
      setSetting({ key: SETTING_KEYS.contactAddress, value: input.contactAddress, group: "contact" }),
      setSetting({ key: SETTING_KEYS.maintenanceMode, value: input.maintenanceMode, group: "maintenance" }),
    ]);

    await recordActivity({ userId: user.id, action: "SETTINGS_CHANGE", entityType: "Setting", metadata: { group: "general" } });
    revalidatePath("/admin/settings");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
