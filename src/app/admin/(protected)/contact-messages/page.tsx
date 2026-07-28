import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/admin-session";
import { listContactMessages } from "@/features/contact-messages/contact-messages.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Contact Messages" };
export const dynamic = "force-dynamic";

type MessageRow = Awaited<ReturnType<typeof listContactMessages>>["items"][number];

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  await requirePermission("contactMessages:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listContactMessages({ page, status: params.status as never, search: params.search });

  const columns: DataTableColumn<MessageRow>[] = [
    {
      key: "name",
      header: "From",
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "message", header: "Message", render: (row) => <p className="line-clamp-2 max-w-sm text-muted-foreground">{row.message}</p> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "assignedTo", header: "Assigned", render: (row) => <span className="text-muted-foreground">{row.assignedTo?.name ?? "—"}</span> },
    { key: "createdAt", header: "Received", render: (row) => <span className="text-muted-foreground">{formatDistanceToNow(row.createdAt, { addSuffix: true })}</span> },
  ];

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Messages submitted through the public contact form." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AdminSearchInput placeholder="Search by name, email, or message…" />
        <AdminSelectFilter
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "NEW", label: "New" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No messages yet"
        rowActions={(row) => (
          <Link href={`/admin/contact-messages/${row.id}`} className="text-sm font-medium text-primary hover:underline">
            View
          </Link>
        )}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
