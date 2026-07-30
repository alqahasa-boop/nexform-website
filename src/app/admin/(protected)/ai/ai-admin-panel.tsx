"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Bot, Gauge, Percent, Coins, Database, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toggleModuleAction } from "@/features/ai/settings/settings.actions";
import { reindexKnowledgeAction, clearKnowledgeIndexAction } from "@/features/ai/knowledge/knowledge.actions";
import type { AiModuleKey, AiProviderKey } from "@/generated/prisma/client";

const MODULE_LABELS: Record<AiModuleKey, string> = {
  GENERAL_CHAT: "General Chat",
  CONSTRUCTION_ADVISOR: "Construction Advisor",
  BUILD_JOURNEY_ASSISTANT: "Build Journey Assistant",
  DOCUMENT_AI: "Document AI",
  IMAGE_AI: "Image AI",
  KNOWLEDGE_SEARCH: "Knowledge Search",
  INTERIOR_DESIGNER: "Interior Designer",
  EXTERIOR_DESIGNER: "Exterior Designer",
  COMPANY_MATCHING: "Company Matching",
};

const MODULE_DESCRIPTIONS: Record<AiModuleKey, string> = {
  GENERAL_CHAT: "The general-purpose assistant widget shown to all site visitors.",
  CONSTRUCTION_ADVISOR: "Specialized guidance on construction stages, materials, and methods.",
  BUILD_JOURNEY_ASSISTANT: "Next-step guidance for users tracking their build journey stage.",
  DOCUMENT_AI: "Analyzes uploaded documents (contracts, specs, reports).",
  IMAGE_AI: "Analyzes uploaded images (rooms, facades, sites, floor plans).",
  KNOWLEDGE_SEARCH: "Semantic and keyword search over NEXFORM's own content.",
  INTERIOR_DESIGNER: "Guided interior concept generator with real gallery inspiration.",
  EXTERIOR_DESIGNER: "Guided facade concept generator from an uploaded photo.",
  COMPANY_MATCHING: "Matches users to real, verified engineering offices.",
};

interface ModuleRow {
  module: AiModuleKey;
  isEnabled: boolean;
}

interface UsageStats {
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  byModule: { module: AiModuleKey; count: number }[];
  totalTokensIn: number;
  totalTokensOut: number;
  avgLatencyMs: number;
}

interface RecentError {
  id: string;
  module: AiModuleKey;
  errorMessage: string | null;
  createdAt: string;
}

interface KnowledgeStatus {
  totalChunks: number;
  byType: { entityType: string; count: number }[];
  lastIndexedAt: string | null;
}

export function AiAdminPanel({
  providerSummary,
  modules,
  usage,
  recentErrors,
  knowledgeStatus,
}: {
  providerSummary: { configured: boolean; providers: AiProviderKey[] };
  modules: ModuleRow[];
  usage: UsageStats;
  recentErrors: RecentError[];
  knowledgeStatus: KnowledgeStatus;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Provider Status"
          value={providerSummary.configured ? providerSummary.providers.join(", ") : "Not configured"}
          icon={Bot}
          tone={providerSummary.configured ? "success" : "warning"}
        />
        <StatCard label="Requests (30d)" value={usage.totalRequests} icon={Gauge} />
        <StatCard
          label="Success Rate"
          value={`${usage.successRate.toFixed(1)}%`}
          icon={Percent}
          tone={usage.successRate < 90 && usage.totalRequests > 0 ? "warning" : "default"}
        />
        <StatCard label="Tokens (in / out)" value={`${usage.totalTokensIn} / ${usage.totalTokensOut}`} icon={Coins} />
        <StatCard label="Indexed Chunks" value={knowledgeStatus.totalChunks} icon={Database} />
      </div>

      <ModuleSettingsSection modules={modules} />

      <KnowledgeIndexSection status={knowledgeStatus} />

      <RecentErrorsSection errors={recentErrors} />
    </div>
  );
}

function ModuleSettingsSection({ modules }: { modules: ModuleRow[] }) {
  const router = useRouter();
  const [pendingModule, setPendingModule] = useState<AiModuleKey | null>(null);

  const handleToggle = (module: AiModuleKey, isEnabled: boolean) => {
    setPendingModule(module);
    toggleModuleAction(module, isEnabled).then((result) => {
      setPendingModule(null);
      if (result.success) {
        toast.success(`${MODULE_LABELS[module]} ${isEnabled ? "enabled" : "disabled"}.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Modules</h2>
      <div className="divide-y divide-border">
        {modules.map((row) => (
          <div key={row.module} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-foreground">{MODULE_LABELS[row.module]}</p>
              <p className="text-xs text-muted-foreground">{MODULE_DESCRIPTIONS[row.module]}</p>
            </div>
            <div className="flex items-center gap-2">
              {pendingModule === row.module && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={row.isEnabled}
                disabled={pendingModule === row.module}
                onCheckedChange={(checked) => handleToggle(row.module, checked === true)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KnowledgeIndexSection({ status }: { status: KnowledgeStatus }) {
  const router = useRouter();
  const [isReindexing, startReindex] = useTransition();

  const handleReindex = () => {
    startReindex(async () => {
      const result = await reindexKnowledgeAction();
      if (result.success) {
        toast.success(`Reindexed ${result.data.totalChunks} chunks (${result.data.embeddingsGenerated} embedded).`);
        if (result.data.embeddingSkippedReason) toast.info(result.data.embeddingSkippedReason);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Knowledge Index</h2>
          <p className="text-xs text-muted-foreground">
            {status.lastIndexedAt ? `Last indexed ${new Date(status.lastIndexedAt).toLocaleString()}` : "Never indexed"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleReindex} disabled={isReindexing}>
            {isReindexing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Reindex Now
          </Button>
          <ConfirmationDialog
            trigger={
              <Button size="sm" variant="outline" disabled={status.totalChunks === 0}>
                <Trash2 />
                Clear Index
              </Button>
            }
            title="Clear knowledge index?"
            description="This deletes every indexed chunk. Search and grounding will fall back to nothing until you reindex."
            confirmLabel="Clear Index"
            destructive
            onConfirm={clearKnowledgeIndexAction}
            onSuccess={() => {
              toast.success("Knowledge index cleared.");
              router.refresh();
            }}
          />
        </div>
      </div>

      {status.byType.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No content indexed yet"
          description="Run a reindex to make NEXFORM's projects, services, articles, and other content searchable and available as AI grounding context."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {status.byType.map((row) => (
            <li key={row.entityType} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{row.entityType}</span>
              <span className="tabular-nums font-medium">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentErrorsSection({ errors }: { errors: RecentError[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Recent Errors</h2>
      {errors.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No recent errors" description="Failed AI requests will show up here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errors.map((error) => (
              <TableRow key={error.id}>
                <TableCell>
                  <Badge variant="outline">{MODULE_LABELS[error.module]}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-destructive" title={error.errorMessage ?? undefined}>
                  {error.errorMessage ?? "Unknown error"}
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(error.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
