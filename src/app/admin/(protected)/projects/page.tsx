import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listProjects } from "@/features/projects/projects.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProjectDialog } from "./project-dialog";
import { ProjectRowActions } from "./project-row-actions";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

type ProjectRow = Awaited<ReturnType<typeof listProjects>>["items"][number];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("projects:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listProjects({ page });

  const columns: DataTableColumn<ProjectRow>[] = [
    { key: "title", header: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "location", header: "Location", render: (row) => <span className="text-muted-foreground">{row.location ?? "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <AdminPageHeader title="Projects" description="Completed and ongoing NEXFORM projects." actions={<ProjectDialog />} />
      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No projects yet"
        rowActions={(row) => (
          <ProjectRowActions project={{ id: row.id, slug: row.slug, title: row.title, summary: row.summary, location: row.location, coverImage: row.coverImage }} />
        )}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
