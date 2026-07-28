import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listProjects } from "@/features/projects/projects.repository";
import { listStyles } from "@/features/styles/styles.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BulkActionsTable } from "@/components/admin/bulk-actions-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { ProjectDialog } from "./project-dialog";
import { ProjectRowActions } from "./project-row-actions";
import { exportProjectsCsvAction, bulkPublishProjectsAction, bulkDeleteProjectsAction } from "@/features/projects/projects.actions";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("projects:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [result, styles] = await Promise.all([listProjects({ page }), listStyles()]);

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Completed and ongoing NEXFORM projects."
        actions={
          <div className="flex gap-2">
            <CsvExportButton action={exportProjectsCsvAction} />
            <ProjectDialog styles={styles} />
          </div>
        }
      />
      <BulkActionsTable
        rows={result.items.map((row) => ({
          id: row.id,
          content: (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.location ?? "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={row.status} />
                <ProjectRowActions
                  project={{
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    summary: row.summary,
                    location: row.location,
                    coverImage: row.coverImage,
                    clientName: row.clientName,
                    videoUrl: row.videoUrl,
                    featured: row.featured,
                    styleId: row.styleId,
                  }}
                  styles={styles}
                />
              </div>
            </div>
          ),
        }))}
        emptyTitle="No projects yet"
        actions={[
          { label: "Publish", onRun: bulkPublishProjectsAction },
          { label: "Delete", destructive: true, confirm: "Delete the selected projects? This cannot be undone.", onRun: bulkDeleteProjectsAction },
        ]}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
