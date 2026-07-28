import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listFaqItems } from "@/features/faq/faq.repository";
import { reorderFaqItemsAction } from "@/features/faq/faq.actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DragReorderList } from "@/components/admin/drag-reorder-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { FaqItemDialog } from "./faq-item-dialog";
import { FaqRowActions } from "./faq-row-actions";

export const metadata: Metadata = { title: "FAQ" };
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  await requirePermission("faq:view");
  const items = await listFaqItems("en", false);

  return (
    <div>
      <AdminPageHeader
        title="FAQ"
        description="Frequently asked questions shown on the public site. Drag rows to change their display order."
        actions={<FaqItemDialog />}
      />
      <DragReorderList
        rows={items.map((row) => ({
          id: row.id,
          content: (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.question}</p>
                <p className="text-xs text-muted-foreground">{row.category ?? "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={row.isPublished ? "PUBLISHED" : "DRAFT"} />
                <FaqRowActions item={row} />
              </div>
            </div>
          ),
        }))}
        emptyTitle="No FAQ items yet"
        onReorder={reorderFaqItemsAction}
      />
    </div>
  );
}
