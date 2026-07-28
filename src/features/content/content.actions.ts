"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import {
  createContent,
  updateContent,
  publishContent,
  deleteContent,
  listContent,
  bulkPublishContent,
  bulkArchiveContent,
  bulkDeleteContent,
} from "./content.repository";
import { createContentSchema, updateContentSchema } from "./types";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { snapshotBeforeUpdate } from "@/features/revisions/revisions.actions";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createContentAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("content:create");
    const parsed = createContentSchema.omit({ authorId: true }).safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const existing = await db.content.findUnique({
      where: { contentType_language_slug: { contentType: parsed.data.contentType, language: parsed.data.language, slug: parsed.data.slug } },
      select: { id: true },
    });
    if (existing) return apiError("A content item with this slug already exists in this language.", "DUPLICATE_SLUG");

    const content = await createContent({ ...parsed.data, body: sanitizeRichText(parsed.data.body), authorId: user.id });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "Content", entityId: content.id });
    revalidatePath("/admin/content");

    return apiSuccess({ id: content.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateContentAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:update");
    const parsed = updateContentSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    if (parsed.data.slug && parsed.data.contentType && parsed.data.language) {
      const existing = await db.content.findUnique({
        where: { contentType_language_slug: { contentType: parsed.data.contentType, language: parsed.data.language, slug: parsed.data.slug } },
        select: { id: true },
      });
      if (existing && existing.id !== id) return apiError("A content item with this slug already exists in this language.", "DUPLICATE_SLUG");
    }

    await snapshotBeforeUpdate("Content", id, user.id);
    await updateContent(id, {
      ...parsed.data,
      ...(parsed.data.body && { body: sanitizeRichText(parsed.data.body) }),
      updatedById: user.id,
    });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "Content", entityId: id });
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/${id}`);

    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishContentAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:publish");
    await publishContent(id);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "Content", entityId: id });
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function archiveContentAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:update");
    await updateContent(id, { status: "ARCHIVED" });
    await recordActivity({ userId: user.id, action: "ARCHIVE", entityType: "Content", entityId: id });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function restoreContentAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:update");
    await updateContent(id, { status: "DRAFT" });
    await recordActivity({ userId: user.id, action: "RESTORE", entityType: "Content", entityId: id });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteContentAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("content:delete");
    await deleteContent(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Content", entityId: id });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkPublishContentAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("content:publish");
    await bulkPublishContent(ids);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "Content", metadata: { bulk: true, ids } });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkArchiveContentAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("content:update");
    await bulkArchiveContent(ids);
    await recordActivity({ userId: user.id, action: "ARCHIVE", entityType: "Content", metadata: { bulk: true, ids } });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkDeleteContentAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("content:delete");
    await bulkDeleteContent(ids);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Content", metadata: { bulk: true, ids } });
    revalidatePath("/admin/content");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function exportContentCsvAction(): Promise<ApiResult<{ csv: string; filename: string }>> {
  try {
    await assertPermission("content:view");
    const { items } = await listContent({ page: 1, pageSize: 10000 });
    const csv = toCsv(items, [
      { key: "title", header: "Title", value: (r) => r.title },
      { key: "slug", header: "Slug", value: (r) => r.slug },
      { key: "contentType", header: "Type", value: (r) => r.contentType },
      { key: "language", header: "Language", value: (r) => r.language },
      { key: "status", header: "Status", value: (r) => r.status },
      { key: "category", header: "Category", value: (r) => r.category?.name ?? "" },
      { key: "author", header: "Author", value: (r) => r.author?.name ?? "" },
      { key: "createdAt", header: "Created At", value: (r) => r.createdAt.toISOString() },
      { key: "publishedAt", header: "Published At", value: (r) => r.publishedAt?.toISOString() ?? "" },
    ]);
    return apiSuccess({ csv, filename: `content-${Date.now()}.csv` });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
