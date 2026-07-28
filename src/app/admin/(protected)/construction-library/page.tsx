import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listLibraryCategories, listLibraryItems } from "@/features/construction-library/construction-library.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { CategoryDialog } from "./category-dialog";
import { ItemDialog } from "./item-dialog";
import { PublishToggle } from "./publish-toggle";

export const metadata: Metadata = { title: "Construction Library" };
export const dynamic = "force-dynamic";

type LibraryItemRow = Awaited<ReturnType<typeof listLibraryItems>>[number];

export default async function ConstructionLibraryPage() {
  await requirePermission("constructionLibrary:view");
  const categories = await listLibraryCategories();
  const items = await listLibraryItems(undefined, false);

  const columns: DataTableColumn<LibraryItemRow>[] = [
    {
      key: "title",
      header: "Document",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.file?.fileName ?? "No file attached"}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (row) => <span className="text-muted-foreground">{row.documentType.replace(/_/g, " ")}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "verified",
      header: "Verified",
      render: (row) => (row.isVerified ? <Badge>Verified</Badge> : <span className="text-muted-foreground">Unverified</span>),
    },
    { key: "downloads", header: "Downloads", render: (row) => <span className="tabular-nums text-muted-foreground">{row.downloadCount}</span> },
  ];

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <AdminPageHeader
        title="Construction Library"
        description="Downloadable documents, government files, and reference material."
        actions={
          <div className="flex gap-2">
            <CategoryDialog />
            <ItemDialog categories={categoryOptions} />
          </div>
        }
      />

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create a category first before adding documents.</p>
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          emptyTitle="No documents yet"
          rowActions={(row) => (
            <div className="flex justify-end gap-1">
              <PublishToggle id={row.id} isPublished={row.status === "PUBLISHED"} />
              <ItemDialog item={row} categories={categoryOptions} />
            </div>
          )}
        />
      )}
    </div>
  );
}
