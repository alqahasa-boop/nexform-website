import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listActivityLogs } from "@/features/activity-logs/activity-logs.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Activity Logs" };
export const dynamic = "force-dynamic";

type LogRow = Awaited<ReturnType<typeof listActivityLogs>>["items"][number];

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entityType?: string }>;
}) {
  await requirePermission("activityLogs:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listActivityLogs({ page, entityType: params.entityType });

  const columns: DataTableColumn<LogRow>[] = [
    {
      key: "actor",
      header: "Actor",
      render: (row) => <span className="font-medium">{row.user?.name ?? row.user?.email ?? "System"}</span>,
    },
    { key: "action", header: "Action", render: (row) => <Badge variant="secondary">{row.action.replace(/_/g, " ")}</Badge> },
    {
      key: "entity",
      header: "Entity",
      render: (row) => (
        <span className="text-muted-foreground">
          {row.entityType}
          {row.entityId && <span className="font-mono text-xs"> #{row.entityId.slice(0, 8)}</span>}
        </span>
      ),
    },
    { key: "ip", header: "IP Address", render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.ipAddress ?? "—"}</span> },
    { key: "when", header: "When", render: (row) => <span className="text-muted-foreground">{formatDistanceToNow(row.createdAt, { addSuffix: true })}</span> },
  ];

  return (
    <div>
      <AdminPageHeader title="Activity Logs" description="Audit trail of administrative actions across NEXFORM." />

      <div className="mb-4">
        <AdminSelectFilter
          paramKey="entityType"
          placeholder="Entity"
          options={[
            { value: "Content", label: "Content" },
            { value: "MediaAsset", label: "Media" },
            { value: "DesignRequest", label: "Design Requests" },
            { value: "ContactMessage", label: "Contact Messages" },
            { value: "User", label: "Users" },
            { value: "Role", label: "Roles" },
            { value: "Company", label: "Companies" },
            { value: "AdvertisementCampaign", label: "Advertisements" },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={result.items} emptyTitle="No activity recorded yet" />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
