import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type RevisionEntityType = "Content" | "Project" | "DesignIdea" | "Service";

/** JSON-safe copy of a Prisma row — converts Decimal/Date fields via their own toJSON(). */
function toSnapshot(row: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(row)) as Prisma.InputJsonValue;
}

/** Snapshots the current DB state of an entity before an update overwrites it. */
export async function createRevision(
  entityType: RevisionEntityType,
  entityId: string,
  currentRow: Record<string, unknown>,
  editedById: string | null
) {
  const last = await db.contentRevision.findFirst({
    where: { entityType, entityId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return db.contentRevision.create({
    data: {
      entityType,
      entityId,
      version: (last?.version ?? 0) + 1,
      snapshot: toSnapshot(currentRow),
      ...(editedById && { editedById }),
    },
  });
}

export function listRevisions(entityType: RevisionEntityType, entityId: string) {
  return db.contentRevision.findMany({
    where: { entityType, entityId },
    orderBy: { version: "desc" },
    include: { editedBy: { select: { name: true, email: true } } },
  });
}

export function getRevisionById(id: string) {
  return db.contentRevision.findUnique({ where: { id } });
}
