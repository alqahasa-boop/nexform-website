"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin-session";
import { updateUser } from "@/features/users/users.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function updateOwnProfileAction(name: string): Promise<ApiResult<null>> {
  const user = await getAdminSession();
  if (!user) return apiError("You must be signed in.", "UNAUTHENTICATED");
  if (!name.trim()) return apiError("Name cannot be empty.", "VALIDATION");

  await updateUser(user.id, { name: name.trim() });
  await recordActivity({ userId: user.id, action: "UPDATE", entityType: "User", entityId: user.id, metadata: { selfProfileUpdate: true } });
  revalidatePath("/admin/profile");
  return apiSuccess(null);
}
