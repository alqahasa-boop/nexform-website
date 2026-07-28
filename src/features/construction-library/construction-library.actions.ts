"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import {
  createLibraryCategory,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
} from "./construction-library.repository";
import { createLibraryCategorySchema, createLibraryItemSchema, updateLibraryItemSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createLibraryCategoryAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("constructionLibrary:create");
    const parsed = createLibraryCategorySchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const category = await createLibraryCategory(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "ConstructionLibraryCategory", entityId: category.id });
    revalidatePath("/admin/construction-library");
    return apiSuccess({ id: category.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function createLibraryItemAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("constructionLibrary:create");
    const parsed = createLibraryItemSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    if (parsed.data.sourceUrl && !parsed.data.sourceOrganization) {
      return apiError("A source URL requires a source organization for verification purposes.", "VALIDATION");
    }

    const item = await createLibraryItem(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "ConstructionLibraryItem", entityId: item.id });
    revalidatePath("/admin/construction-library");
    return apiSuccess({ id: item.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateLibraryItemAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionLibrary:update");
    const parsed = updateLibraryItemSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    // Never let a document be marked verified without a documented source — enforced server-side, not just in the UI.
    if (parsed.data.isVerified && !parsed.data.sourceOrganization && !parsed.data.sourceUrl) {
      return apiError("Cannot mark a document verified without a source organization or source URL.", "VALIDATION");
    }

    await updateLibraryItem(id, parsed.data);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "ConstructionLibraryItem", entityId: id });
    revalidatePath("/admin/construction-library");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishLibraryItemAction(id: string, publish: boolean): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionLibrary:publish");
    await updateLibraryItem(id, { status: publish ? "PUBLISHED" : "DRAFT" });
    await recordActivity({ userId: user.id, action: publish ? "PUBLISH" : "ARCHIVE", entityType: "ConstructionLibraryItem", entityId: id });
    revalidatePath("/admin/construction-library");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteLibraryItemAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionLibrary:delete");
    await deleteLibraryItem(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "ConstructionLibraryItem", entityId: id });
    revalidatePath("/admin/construction-library");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
