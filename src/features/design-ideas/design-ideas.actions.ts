"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { getCustomerSession } from "@/lib/auth/customer-session";
import {
  createDesignIdea,
  updateDesignIdea,
  publishDesignIdea,
  deleteDesignIdea,
  bulkPublishDesignIdeas,
  bulkDeleteDesignIdeas,
  toggleDesignIdeaSave,
} from "./design-ideas.repository";
import { createDesignIdeaSchema, updateDesignIdeaSchema } from "./types";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { snapshotBeforeUpdate } from "@/features/revisions/revisions.actions";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createDesignIdeaAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("designIdeas:create");
    const parsed = createDesignIdeaSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const existing = await db.designIdea.findUnique({
      where: { language_slug: { language: parsed.data.language, slug: parsed.data.slug } },
      select: { id: true },
    });
    if (existing) return apiError("A design idea with this slug already exists in this language.", "DUPLICATE_SLUG");

    const idea = await createDesignIdea({
      ...parsed.data,
      designerId: user.id,
      ...(parsed.data.description && { description: sanitizeRichText(parsed.data.description) }),
    });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "DesignIdea", entityId: idea.id });
    revalidatePath("/admin/design-ideas");
    return apiSuccess({ id: idea.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateDesignIdeaAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designIdeas:update");
    const parsed = updateDesignIdeaSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await snapshotBeforeUpdate("DesignIdea", id, user.id);
    await updateDesignIdea(id, {
      ...parsed.data,
      ...(parsed.data.description && { description: sanitizeRichText(parsed.data.description) }),
    });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "DesignIdea", entityId: id });
    revalidatePath("/admin/design-ideas");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishDesignIdeaAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designIdeas:publish");
    await publishDesignIdea(id);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "DesignIdea", entityId: id });
    revalidatePath("/admin/design-ideas");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteDesignIdeaAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designIdeas:delete");
    await deleteDesignIdea(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "DesignIdea", entityId: id });
    revalidatePath("/admin/design-ideas");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkPublishDesignIdeasAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("designIdeas:publish");
    await bulkPublishDesignIdeas(ids);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "DesignIdea", metadata: { bulk: true, ids } });
    revalidatePath("/admin/design-ideas");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkDeleteDesignIdeasAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("designIdeas:delete");
    await bulkDeleteDesignIdeas(ids);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "DesignIdea", metadata: { bulk: true, ids } });
    revalidatePath("/admin/design-ideas");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

/**
 * Public entry point for the Gallery "Save" heart button — self-service, gated by
 * "is anyone signed in" rather than an admin permission (mirrors how
 * `createDesignRequestAction` uses `getAdminSession()` directly for the same reason).
 */
export async function toggleSaveDesignIdeaAction(designIdeaId: string): Promise<ApiResult<{ saved: boolean }>> {
  const user = await getCustomerSession();
  if (!user) return apiError("Sign in to save design ideas.", "UNAUTHENTICATED");

  const result = await toggleDesignIdeaSave(designIdeaId, user.id);
  revalidatePath("/gallery");
  revalidatePath("/customer/dashboard");
  return apiSuccess(result);
}

/**
 * IDs the signed-in customer has already saved, so the Gallery's heart icons can
 * reflect real state on load. Returns an empty list for guests — deliberately not
 * an error, since "no saves yet" and "not signed in" render identically (an
 * outlined heart).
 */
export async function getMySavedDesignIdeaIdsAction(): Promise<ApiResult<string[]>> {
  const user = await getCustomerSession();
  if (!user) return apiSuccess([]);

  const saves = await db.designIdeaSave.findMany({ where: { userId: user.id }, select: { designIdeaId: true } });
  return apiSuccess(saves.map((s) => s.designIdeaId));
}
