"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { getRevisionById, createRevision, listRevisions, type RevisionEntityType } from "./revisions.repository";
import { updateContent } from "@/features/content/content.repository";
import { updateProject } from "@/features/projects/projects.repository";
import { updateDesignIdea } from "@/features/design-ideas/design-ideas.repository";
import { updateService } from "@/features/services/services.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";
import type { PermissionKey } from "@/config/permissions.config";

const REVISION_PERMISSIONS: Record<RevisionEntityType, PermissionKey> = {
  Content: "content:update",
  Service: "content:update",
  Project: "projects:update",
  DesignIdea: "designIdeas:update",
};

const REVALIDATE_PATHS: Record<RevisionEntityType, string> = {
  Content: "/admin/content",
  Service: "/admin/services",
  Project: "/admin/projects",
  DesignIdea: "/admin/design-ideas",
};

/** Excludes fields a restore must never overwrite (identity, relations, timestamps managed by Prisma). */
const NON_RESTORABLE_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "translationGroupId",
  "language",
  "authorId",
  "createdById",
  "designerId",
  "updatedById",
  "reviewerId",
  "publishedAt",
  "scheduledAt",
]);

function toRestorableData(snapshot: unknown): Record<string, unknown> {
  const raw = (snapshot ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (NON_RESTORABLE_FIELDS.has(key)) continue;
    if (key.endsWith("Id") && value === null) continue; // relation FKs restored as null would break required relations
    if (typeof value === "object" && value !== null && !Array.isArray(value)) continue; // skip nested relation objects
    data[key] = value;
  }
  return data;
}

export async function listRevisionsAction(
  entityType: RevisionEntityType,
  entityId: string
): Promise<ApiResult<{ id: string; version: number; createdAt: Date; editorName: string | null }[]>> {
  try {
    await assertPermission(REVISION_PERMISSIONS[entityType]);
    const revisions = await listRevisions(entityType, entityId);
    return apiSuccess(
      revisions.map((r) => ({
        id: r.id,
        version: r.version,
        createdAt: r.createdAt,
        editorName: r.editedBy?.name ?? r.editedBy?.email ?? null,
      }))
    );
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function restoreRevisionAction(revisionId: string): Promise<ApiResult<null>> {
  try {
    const revision = await getRevisionById(revisionId);
    if (!revision) return apiError("Revision not found.", "NOT_FOUND");

    const entityType = revision.entityType as RevisionEntityType;
    const permission = REVISION_PERMISSIONS[entityType];
    if (!permission) return apiError("Unsupported entity type.", "VALIDATION");

    const user = await assertPermission(permission);
    const data = toRestorableData(revision.snapshot);

    switch (entityType) {
      case "Content":
        await updateContent(revision.entityId, data as never);
        break;
      case "Project":
        await updateProject(revision.entityId, data as never);
        break;
      case "DesignIdea":
        await updateDesignIdea(revision.entityId, data as never);
        break;
      case "Service":
        await updateService(revision.entityId, data as never);
        break;
    }

    await recordActivity({
      userId: user.id,
      action: "RESTORE",
      entityType,
      entityId: revision.entityId,
      metadata: { revisionVersion: revision.version },
    });
    revalidatePath(REVALIDATE_PATHS[entityType]);
    revalidatePath(`${REVALIDATE_PATHS[entityType]}/${revision.entityId}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

/** Called by an update action right before persisting changes, to snapshot the pre-update state. */
export async function snapshotBeforeUpdate(entityType: RevisionEntityType, entityId: string, editedById: string) {
  let currentRow: Record<string, unknown> | null = null;
  switch (entityType) {
    case "Content":
      currentRow = await db.content.findUnique({ where: { id: entityId } });
      break;
    case "Project":
      currentRow = await db.project.findUnique({ where: { id: entityId } });
      break;
    case "DesignIdea":
      currentRow = await db.designIdea.findUnique({ where: { id: entityId } });
      break;
    case "Service":
      currentRow = await db.service.findUnique({ where: { id: entityId } });
      break;
  }
  if (!currentRow) return;
  await createRevision(entityType, entityId, currentRow, editedById);
}
