import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listServices } from "@/features/services/services.repository";
import { reorderServicesAction, bulkPublishServicesAction, bulkDeleteServicesAction } from "@/features/services/services.actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DragReorderList } from "@/components/admin/drag-reorder-list";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { ServiceDialog } from "./service-dialog";
import { ServiceRowActions } from "./service-row-actions";

export const metadata: Metadata = { title: "Services" };
export const dynamic = "force-dynamic";

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("content:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listServices({ page });

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Services offered by NEXFORM, shown on the public site. Drag rows to change their public display order."
        actions={<ServiceDialog />}
      />
      <DragReorderList
        rows={result.items.map((row) => ({
          id: row.id,
          content: (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.pricingDisplay.replace(/_/g, " ")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={row.status} />
                <ServiceRowActions
                  service={{
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    description: row.description,
                    pricingDisplay: row.pricingDisplay,
                    price: row.price,
                    icon: row.icon,
                    features: row.features,
                    ctaLabel: row.ctaLabel,
                    ctaUrl: row.ctaUrl,
                  }}
                />
              </div>
            </div>
          ),
        }))}
        emptyTitle="No services yet"
        onReorder={reorderServicesAction}
        bulkActions={[
          { label: "Publish", onRun: bulkPublishServicesAction },
          { label: "Delete", destructive: true, confirm: "Delete the selected services? This cannot be undone.", onRun: bulkDeleteServicesAction },
        ]}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
