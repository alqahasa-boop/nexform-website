import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin-session";
import { listContent } from "@/features/content/content.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BulkActionsTable } from "@/components/admin/bulk-actions-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { ContentRowActions } from "./content-row-actions";
import { exportContentCsvAction, bulkPublishContentAction, bulkArchiveContentAction, bulkDeleteContentAction } from "@/features/content/content.actions";

export const metadata: Metadata = { title: "Content" };
export const dynamic = "force-dynamic";

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; contentType?: string; search?: string }>;
}) {
  await requirePermission("content:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listContent({
    page,
    status: params.status as never,
    contentType: params.contentType as never,
    search: params.search,
  });

  return (
    <div>
      <AdminPageHeader
        title="Content"
        description="Manage articles and pages across the site."
        actions={
          <div className="flex gap-2">
            <CsvExportButton action={exportContentCsvAction} />
            <Button render={<Link href="/admin/content/new" />} nativeButton={false}>
              <Plus className="size-4" />
              New Content
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AdminSearchInput placeholder="Search by title…" />
        <AdminSelectFilter
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "DRAFT", label: "Draft" },
            { value: "PENDING_REVIEW", label: "Pending Review" },
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
        <AdminSelectFilter
          paramKey="contentType"
          placeholder="Type"
          options={[
            { value: "ARTICLE", label: "Article" },
            { value: "PAGE", label: "Page" },
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
                  /{row.slug} · {row.contentType} · {row.language.toUpperCase()} · {row.category?.name ?? "Uncategorized"}
                  {row.author?.name ? ` · ${row.author.name}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={row.status} />
                <ContentRowActions id={row.id} />
              </div>
            </div>
          ),
        }))}
        emptyTitle="No content yet"
        actions={[
          { label: "Publish", onRun: bulkPublishContentAction },
          { label: "Archive", onRun: bulkArchiveContentAction },
          { label: "Delete", destructive: true, confirm: "Delete the selected content items? This cannot be undone.", onRun: bulkDeleteContentAction },
        ]}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
