"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import {
  createProject,
  updateProject,
  publishProject,
  deleteProject,
  listProjects,
  bulkPublishProjects,
  bulkDeleteProjects,
} from "./projects.repository";
import { createProjectSchema, updateProjectSchema } from "./types";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { snapshotBeforeUpdate } from "@/features/revisions/revisions.actions";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createProjectAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("projects:create");
    const parsed = createProjectSchema.omit({ createdById: true }).safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const existing = await db.project.findUnique({
      where: { language_slug: { language: parsed.data.language, slug: parsed.data.slug } },
      select: { id: true },
    });
    if (existing) return apiError("A project with this slug already exists in this language.", "DUPLICATE_SLUG");

    const project = await createProject({
      ...parsed.data,
      createdById: user.id,
      ...(parsed.data.description && { description: sanitizeRichText(parsed.data.description) }),
    });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "Project", entityId: project.id });
    revalidatePath("/admin/projects");
    return apiSuccess({ id: project.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateProjectAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("projects:update");
    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await snapshotBeforeUpdate("Project", id, user.id);
    await updateProject(id, {
      ...parsed.data,
      ...(parsed.data.description && { description: sanitizeRichText(parsed.data.description) }),
    });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "Project", entityId: id });
    revalidatePath("/admin/projects");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishProjectAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("projects:publish");
    await publishProject(id);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "Project", entityId: id });
    revalidatePath("/admin/projects");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteProjectAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("projects:delete");
    await deleteProject(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Project", entityId: id });
    revalidatePath("/admin/projects");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkPublishProjectsAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("projects:publish");
    await bulkPublishProjects(ids);
    await recordActivity({ userId: user.id, action: "PUBLISH", entityType: "Project", metadata: { bulk: true, ids } });
    revalidatePath("/admin/projects");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function bulkDeleteProjectsAction(ids: string[]): Promise<ApiResult<null>> {
  try {
    if (ids.length === 0) return apiError("No items selected.", "VALIDATION");
    const user = await assertPermission("projects:delete");
    await bulkDeleteProjects(ids);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Project", metadata: { bulk: true, ids } });
    revalidatePath("/admin/projects");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function exportProjectsCsvAction(): Promise<ApiResult<{ csv: string; filename: string }>> {
  try {
    await assertPermission("projects:view");
    const { items } = await listProjects({ page: 1, pageSize: 10000 });
    const csv = toCsv(items, [
      { key: "title", header: "Title", value: (r) => r.title },
      { key: "slug", header: "Slug", value: (r) => r.slug },
      { key: "language", header: "Language", value: (r) => r.language },
      { key: "status", header: "Status", value: (r) => r.status },
      { key: "category", header: "Category", value: (r) => r.category?.name ?? "" },
      { key: "projectType", header: "Project Type", value: (r) => r.projectType ?? "" },
      { key: "location", header: "Location", value: (r) => r.location ?? "" },
      { key: "clientName", header: "Client", value: (r) => r.clientName ?? "" },
      { key: "featured", header: "Featured", value: (r) => (r.featured ? "Yes" : "No") },
      { key: "createdAt", header: "Created At", value: (r) => r.createdAt.toISOString() },
    ]);
    return apiSuccess({ csv, filename: `projects-${Date.now()}.csv` });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
