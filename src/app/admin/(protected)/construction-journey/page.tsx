import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listJourneyStages } from "@/features/construction-journey/construction-journey.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { StageDialog, type JourneyStageData } from "./stage-dialog";
import { StagePublishToggle } from "./publish-toggle";

export const metadata: Metadata = { title: "Construction Journey" };
export const dynamic = "force-dynamic";

export default async function ConstructionJourneyPage() {
  await requirePermission("constructionJourney:view");
  const stages = await listJourneyStages("en", false);

  const columns: DataTableColumn<JourneyStageData>[] = [
    { key: "order", header: "#", render: (row) => <span className="tabular-nums text-muted-foreground">{row.order}</span> },
    { key: "title", header: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Construction Journey"
        description="The step-by-step building process shown to visitors."
        actions={<StageDialog nextOrder={stages.length} />}
      />
      <DataTable
        columns={columns}
        rows={stages}
        emptyTitle="No stages yet"
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <StagePublishToggle id={row.id} isPublished={row.status === "PUBLISHED"} />
            <StageDialog stage={row} />
          </div>
        )}
      />
    </div>
  );
}
