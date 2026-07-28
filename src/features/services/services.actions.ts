"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { createService, updateService, publishService, deleteService } from "./services.repository";
import { createServiceSchema, updateServiceSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createServiceAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("content:create");
    const parsed = createServiceSchema.omit({ createdById: true }).safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const existing = await db.service.findUnique({
      where: { language_slug: { language: parsed.data.language, slug: parsed.data.slug } },
      select: { id: true },
    });
    if (existing) return apiError("A service with this slug already exists in this language.", "DUPLICATE_SLUG");

    const service = await createService({ ...parsed.data, createdById: user.id });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "Service", entityId: service.id });
    revalidatePath("/admin/services");
    return apiSuccess({ id: service.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateServiceAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:update");
    const parsed = updateServiceSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await updateService(id, parsed.data);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "Service", entityId: id });
    revalidatePath("/admin/services");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishServiceAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:publish");
    await publishService(id);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "Service", entityId: id });
    revalidatePath("/admin/services");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteServiceAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:delete");
    await deleteService(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Service", entityId: id });
    revalidatePath("/admin/services");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
