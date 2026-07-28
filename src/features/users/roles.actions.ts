"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { setRolePermissions } from "./roles.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import type { PermissionKey } from "@/config/permissions.config";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function updateRolePermissionsAction(roleId: string, permissionKeys: PermissionKey[]): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("roles:manage");
    await setRolePermissions(roleId, permissionKeys);
    await recordActivity({
      userId: user.id,
      action: "PERMISSION_CHANGE",
      entityType: "Role",
      entityId: roleId,
      metadata: { permissionCount: permissionKeys.length },
    });
    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${roleId}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
