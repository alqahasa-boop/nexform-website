import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin-session";
import { listContent } from "@/features/content/content.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ContentRowActions } from "./content-row-actions";

export const metadata: Metadata = { title: "Content" };
export const dynamic = "force-dynamic";

type ContentRow = Awaited<ReturnType<typeof listContent>>["items"][number];

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

  const columns: DataTableColumn<ContentRow>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (row) => <span className="text-muted-foreground">{row.contentType}</span> },
    { key: "language", header: "Lang", render: (row) => <span className="uppercase text-muted-foreground">{row.language}</span> },
    { key: "category", header: "Category", render: (row) => <span className="text-muted-foreground">{row.category?.name ?? "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "author", header: "Author", render: (row) => <span className="text-muted-foreground">{row.author?.name ?? "—"}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Content"
        description="Manage articles and pages across the site."
        actions={
          <Button render={<Link href="/admin/content/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Content
          </Button>
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

      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No content yet"
        emptyDescription="Create your first article or page to get started."
        rowActions={(row) => <ContentRowActions id={row.id} />}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
