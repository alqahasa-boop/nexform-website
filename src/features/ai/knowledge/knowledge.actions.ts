"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { reindexAll, clearKnowledgeIndex, type ReindexResult } from "./reindex";
import { countIndexedChunks, countIndexedChunksByType, getLastIndexedAt } from "./knowledge.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function reindexKnowledgeAction(): Promise<ApiResult<ReindexResult>> {
  try {
    const user = await assertPermission("ai:manage");
    const result = await reindexAll();
    await recordActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "AiKnowledgeChunk",
      metadata: { reindexed: true, totalChunks: result.totalChunks, embeddingsGenerated: result.embeddingsGenerated },
    });
    revalidatePath("/admin/ai");
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function clearKnowledgeIndexAction(): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("ai:manage");
    await clearKnowledgeIndex();
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "AiKnowledgeChunk", metadata: { clearedIndex: true } });
    revalidatePath("/admin/ai");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function getKnowledgeIndexStatusAction(): Promise<
  ApiResult<{ totalChunks: number; byType: { entityType: string; count: number }[]; lastIndexedAt: Date | null }>
> {
  try {
    await assertPermission("ai:view");
    const [totalChunks, byType, last] = await Promise.all([
      countIndexedChunks(),
      countIndexedChunksByType(),
      getLastIndexedAt(),
    ]);
    return apiSuccess({
      totalChunks,
      byType: byType.map((row) => ({ entityType: row.entityType, count: row._count._all })),
      lastIndexedAt: last?.indexedAt ?? null,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
