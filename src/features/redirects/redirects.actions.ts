"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { createRedirect, deleteRedirect } from "./redirects.repository";
import { createRedirectSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createRedirectAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("seo:manage");
    const parsed = createRedirectSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    if (parsed.data.fromPath === parsed.data.toPath) return apiError("Redirect source and destination cannot be the same.", "VALIDATION");

    const existing = await db.redirect.findUnique({ where: { fromPath: parsed.data.fromPath }, select: { id: true } });
    if (existing) return apiError("A redirect for this path already exists.", "DUPLICATE");

    const redirect = await createRedirect(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "Redirect", entityId: redirect.id });
    revalidatePath("/admin/seo");
    return apiSuccess({ id: redirect.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteRedirectAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("seo:manage");
    await deleteRedirect(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Redirect", entityId: id });
    revalidatePath("/admin/seo");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
