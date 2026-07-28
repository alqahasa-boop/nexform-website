import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listDesignIdeas } from "@/features/design-ideas/design-ideas.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BulkActionsTable } from "@/components/admin/bulk-actions-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { IdeaDialog } from "./idea-dialog";
import { IdeaRowActions } from "./idea-row-actions";
import { bulkPublishDesignIdeasAction, bulkDeleteDesignIdeasAction } from "@/features/design-ideas/design-ideas.actions";

export const metadata: Metadata = { title: "Design Ideas" };
export const dynamic = "force-dynamic";

export default async function DesignIdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; designCategory?: string }>;
}) {
  await requirePermission("designIdeas:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listDesignIdeas({ page, designCategory: params.designCategory as never });

  return (
    <div>
      <AdminPageHeader title="Design Ideas" description="Facade, interior, and commercial design inspiration." actions={<IdeaDialog />} />

      <div className="mb-4">
        <AdminSelectFilter
          paramKey="designCategory"
          placeholder="Category"
          options={[
            { value: "GENERAL", label: "General" },
            { value: "FACADE", label: "Facade" },
            { value: "INTERIOR", label: "Interior" },
            { value: "COMMERCIAL_BOOTH", label: "Commercial Booth" },
          ]}
        />
      </div>

      <BulkActionsTable
        rows={result.items.map((row) => ({
          id: row.id,
          content: (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">
                  {row.designCategory.replace(/_/g, " ")} · {row.viewCount} views · {row.saveCount} saves
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={row.status} />
                <IdeaRowActions idea={{ id: row.id, slug: row.slug, title: row.title, description: row.description, designCategory: row.designCategory, coverImage: row.coverImage }} />
              </div>
            </div>
          ),
        }))}
        emptyTitle="No design ideas yet"
        actions={[
          { label: "Publish", onRun: bulkPublishDesignIdeasAction },
          { label: "Delete", destructive: true, confirm: "Delete the selected design ideas? This cannot be undone.", onRun: bulkDeleteDesignIdeasAction },
        ]}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
