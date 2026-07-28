"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { createFaqItem, updateFaqItem, deleteFaqItem } from "./faq.repository";
import { createFaqItemSchema, updateFaqItemSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createFaqItemAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("faq:create");
    const parsed = createFaqItemSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const item = await createFaqItem(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "FaqItem", entityId: item.id });
    revalidatePath("/admin/faq");
    return apiSuccess({ id: item.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateFaqItemAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("faq:update");
    const parsed = updateFaqItemSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await updateFaqItem(id, parsed.data);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "FaqItem", entityId: id });
    revalidatePath("/admin/faq");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function toggleFaqPublishedAction(id: string, isPublished: boolean): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("faq:publish");
    await updateFaqItem(id, { isPublished });
    await recordActivity({ userId: user.id, action: isPublished ? "PUBLISH" : "ARCHIVE", entityType: "FaqItem", entityId: id });
    revalidatePath("/admin/faq");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteFaqItemAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("faq:delete");
    await deleteFaqItem(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "FaqItem", entityId: id });
    revalidatePath("/admin/faq");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
