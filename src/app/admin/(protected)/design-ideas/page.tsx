import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listDesignIdeas } from "@/features/design-ideas/design-ideas.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { IdeaDialog } from "./idea-dialog";
import { IdeaRowActions } from "./idea-row-actions";

export const metadata: Metadata = { title: "Design Ideas" };
export const dynamic = "force-dynamic";

type IdeaRow = Awaited<ReturnType<typeof listDesignIdeas>>["items"][number];

export default async function DesignIdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; designCategory?: string }>;
}) {
  await requirePermission("designIdeas:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listDesignIdeas({ page, designCategory: params.designCategory as never });

  const columns: DataTableColumn<IdeaRow>[] = [
    { key: "title", header: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "category", header: "Category", render: (row) => <span className="text-muted-foreground">{row.designCategory.replace(/_/g, " ")}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "views", header: "Views", render: (row) => <span className="tabular-nums text-muted-foreground">{row.viewCount}</span> },
    { key: "saves", header: "Saves", render: (row) => <span className="tabular-nums text-muted-foreground">{row.saveCount}</span> },
  ];

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

      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No design ideas yet"
        rowActions={(row) => <IdeaRowActions idea={{ id: row.id, slug: row.slug, title: row.title, description: row.description, designCategory: row.designCategory, coverImage: row.coverImage }} />}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
