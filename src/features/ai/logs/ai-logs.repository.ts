import { db } from "@/lib/db";
import type { AiModuleKey, AiProviderKey } from "@/generated/prisma/client";

export interface RecordPromptLogInput {
  userId?: string;
  guestSessionId?: string;
  module: AiModuleKey;
  providerKey?: AiProviderKey;
  model?: string;
  promptPreview?: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  success: boolean;
  errorMessage?: string;
}

export function recordPromptLog(input: RecordPromptLogInput) {
  return db.aiPromptLog.create({ data: input });
}

export function listRecentPromptLogs(limit = 50) {
  return db.aiPromptLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getUsageStats(range: { from: Date; to: Date }) {
  const where = { createdAt: { gte: range.from, lte: range.to } };

  const [totalRequests, failedRequests, byModule, tokenAgg] = await Promise.all([
    db.aiPromptLog.count({ where }),
    db.aiPromptLog.count({ where: { ...where, success: false } }),
    db.aiPromptLog.groupBy({ by: ["module"], where, _count: { _all: true } }),
    db.aiPromptLog.aggregate({
      where,
      _sum: { tokensIn: true, tokensOut: true },
      _avg: { latencyMs: true },
    }),
  ]);

  return {
    totalRequests,
    failedRequests,
    successRate: totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 100,
    byModule: byModule.map((row) => ({ module: row.module, count: row._count._all })),
    totalTokensIn: tokenAgg._sum.tokensIn ?? 0,
    totalTokensOut: tokenAgg._sum.tokensOut ?? 0,
    avgLatencyMs: tokenAgg._avg.latencyMs ?? 0,
  };
}

export function listRecentErrors(limit = 20) {
  return db.aiPromptLog.findMany({
    where: { success: false },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
