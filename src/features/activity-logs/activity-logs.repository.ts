import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { LogActivityInput } from "./types";

export function recordActivity(input: LogActivityInput) {
  return db.activityLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      ...(input.userId && { userId: input.userId }),
      ...(input.entityId && { entityId: input.entityId }),
      ...(input.metadata && { metadata: input.metadata as Prisma.InputJsonValue }),
      ...(input.ipAddress && { ipAddress: input.ipAddress }),
      ...(input.userAgent && { userAgent: input.userAgent }),
    },
  });
}

export function listActivityLogs(
  params: PaginationParams & { userId?: string; entityType?: string } = {}
) {
  const where = {
    ...(params.userId && { userId: params.userId }),
    ...(params.entityType && { entityType: params.entityType }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.activityLog.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.activityLog.findMany({
      where,
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}
