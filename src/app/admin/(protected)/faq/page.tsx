import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listFaqItems } from "@/features/faq/faq.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { FaqItemDialog, type FaqItemData } from "./faq-item-dialog";

export const metadata: Metadata = { title: "FAQ" };
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  await requirePermission("faq:view");
  const items = await listFaqItems("en", false);

  const columns: DataTableColumn<FaqItemData>[] = [
    { key: "question", header: "Question", render: (row) => <span className="font-medium">{row.question}</span> },
    { key: "category", header: "Category", render: (row) => <span className="text-muted-foreground">{row.category ?? "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.isPublished ? "PUBLISHED" : "DRAFT"} /> },
  ];

  return (
    <div>
      <AdminPageHeader title="FAQ" description="Frequently asked questions shown on the public site." actions={<FaqItemDialog />} />
      <DataTable columns={columns} rows={items} emptyTitle="No FAQ items yet" rowActions={(row) => <FaqItemDialog item={row} />} />
    </div>
  );
}
