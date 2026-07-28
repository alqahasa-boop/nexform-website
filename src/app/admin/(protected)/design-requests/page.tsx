import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/admin-session";
import { listDesignRequests } from "@/features/design-requests/design-requests.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { exportDesignRequestsCsvAction } from "@/features/design-requests/design-requests.actions";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Design Requests" };
export const dynamic = "force-dynamic";

type RequestRow = Awaited<ReturnType<typeof listDesignRequests>>["items"][number];

const STATUS_OPTIONS = [
  "NEW", "UNDER_REVIEW", "WAITING_FOR_CUSTOMER_INFO", "ACCEPTED", "IN_PROGRESS",
  "DRAFT_READY", "REVISION_REQUESTED", "FINAL_READY", "DELIVERED", "COMPLETED", "CANCELLED",
].map((s) => ({ value: s, label: s.replace(/_/g, " ") }));

export default async function DesignRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  await requirePermission("designRequests:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listDesignRequests({ page, status: params.status as never, search: params.search });

  const columns: DataTableColumn<RequestRow>[] = [
    {
      key: "requestNumber",
      header: "Request",
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-medium text-foreground">{row.requestNumber}</p>
          <p className="text-sm">{row.fullName}</p>
        </div>
      ),
    },
    { key: "service", header: "Service", render: (row) => <span className="text-muted-foreground">{row.service?.title ?? "—"}</span> },
    { key: "priority", header: "Priority", render: (row) => <StatusBadge status={row.priority} /> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "assignedTo", header: "Assigned To", render: (row) => <span className="text-muted-foreground">{row.assignedTo?.name ?? "Unassigned"}</span> },
    { key: "createdAt", header: "Received", render: (row) => <span className="text-muted-foreground">{formatDistanceToNow(row.createdAt, { addSuffix: true })}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Design Requests"
        description="Customer requests for architectural and interior design work."
        actions={<CsvExportButton action={exportDesignRequestsCsvAction} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AdminSearchInput placeholder="Search by name, email, or request #…" />
        <AdminSelectFilter paramKey="status" placeholder="Status" options={STATUS_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No design requests yet"
        emptyDescription="Submissions from the public design-request form will appear here."
        rowActions={(row) => (
          <Link href={`/admin/design-requests/${row.id}`} className="text-sm font-medium text-primary hover:underline">
            View
          </Link>
        )}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
