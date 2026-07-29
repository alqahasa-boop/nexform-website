import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getConfiguredProviderSummary } from "@/lib/ai/orchestrator";
import { listModuleSettings } from "@/features/ai/settings/settings.repository";
import { getUsageStats, listRecentErrors } from "@/features/ai/logs/ai-logs.repository";
import { countIndexedChunks, countIndexedChunksByType, getLastIndexedAt } from "@/features/ai/knowledge/knowledge.repository";
import { AiAdminPanel } from "./ai-admin-panel";
import type { AiModuleKey } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "AI Management" };
export const dynamic = "force-dynamic";

const ALL_MODULES: AiModuleKey[] = [
  "GENERAL_CHAT",
  "CONSTRUCTION_ADVISOR",
  "BUILD_JOURNEY_ASSISTANT",
  "DOCUMENT_AI",
  "IMAGE_AI",
  "KNOWLEDGE_SEARCH",
];

export default async function AiAdminPage() {
  await requirePermission("ai:view");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [providerSummary, moduleSettings, usage, recentErrors, totalChunks, chunksByType, lastIndexedAt] =
    await Promise.all([
      Promise.resolve(getConfiguredProviderSummary()),
      listModuleSettings(),
      getUsageStats({ from: thirtyDaysAgo, to: now }),
      listRecentErrors(10),
      countIndexedChunks(),
      countIndexedChunksByType(),
      getLastIndexedAt(),
    ]);

  const settingsByModule = new Map(moduleSettings.map((s) => [s.module, s.isEnabled]));
  const modules = ALL_MODULES.map((module) => ({
    module,
    isEnabled: settingsByModule.get(module) ?? true,
  }));

  return (
    <div>
      <AdminPageHeader
        title="AI Management"
        description="Configure NEXFORM's AI assistant modules, monitor usage, and manage the knowledge index."
      />
      <AiAdminPanel
        providerSummary={providerSummary}
        modules={modules}
        usage={usage}
        recentErrors={recentErrors.map((e) => ({
          id: e.id,
          module: e.module,
          errorMessage: e.errorMessage,
          createdAt: e.createdAt.toISOString(),
        }))}
        knowledgeStatus={{
          totalChunks,
          byType: chunksByType.map((row) => ({ entityType: row.entityType, count: row._count._all })),
          lastIndexedAt: lastIndexedAt?.indexedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
