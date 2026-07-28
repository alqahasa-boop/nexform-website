import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listServices } from "@/features/services/services.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { ServiceDialog } from "./service-dialog";
import { ServiceRowActions } from "./service-row-actions";

export const metadata: Metadata = { title: "Services" };
export const dynamic = "force-dynamic";

type ServiceRow = Awaited<ReturnType<typeof listServices>>["items"][number];

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("content:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listServices({ page });

  const columns: DataTableColumn<ServiceRow>[] = [
    { key: "title", header: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "pricing", header: "Pricing", render: (row) => <span className="text-muted-foreground">{row.pricingDisplay.replace(/_/g, " ")}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <AdminPageHeader title="Services" description="Services offered by NEXFORM, shown on the public site." actions={<ServiceDialog />} />
      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No services yet"
        rowActions={(row) => (
          <ServiceRowActions service={{ id: row.id, slug: row.slug, title: row.title, description: row.description, pricingDisplay: row.pricingDisplay, price: row.price }} />
        )}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
