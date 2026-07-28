import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCampaigns } from "@/features/advertisements/advertisements.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CampaignRowActions } from "./campaign-row-actions";

export const metadata: Metadata = { title: "Advertisements" };
export const dynamic = "force-dynamic";

type CampaignRow = Awaited<ReturnType<typeof listCampaigns>>[number];

export default async function AdvertisementsPage() {
  await requirePermission("advertisements:view");
  const campaigns = await listCampaigns();

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const columns: DataTableColumn<CampaignRow>[] = [
    {
      key: "name",
      header: "Campaign",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.company.name}</p>
        </div>
      ),
    },
    { key: "package", header: "Package", render: (row) => <span className="text-muted-foreground">{row.package?.name ?? "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "window",
      header: "Window",
      render: (row) => (
        <span className="text-muted-foreground">
          {row.startDate?.toLocaleDateString() ?? "—"} → {row.endDate?.toLocaleDateString() ?? "—"}
          {row.status === "ACTIVE" && row.endDate && row.endDate.getTime() - now < sevenDays && (
            <AlertTriangle className="ms-1 inline size-3.5 text-destructive" aria-label="Expiring soon" />
          )}
        </span>
      ),
    },
    { key: "creatives", header: "Creatives", render: (row) => <span className="tabular-nums text-muted-foreground">{row.creatives.length}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Advertisements"
        description="Manage advertising campaigns, creatives, and placements."
        actions={
          <Button render={<Link href="/admin/advertisements/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Campaign
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={campaigns}
        emptyTitle="No campaigns yet"
        rowActions={(row) => <CampaignRowActions id={row.id} />}
      />
    </div>
  );
}
