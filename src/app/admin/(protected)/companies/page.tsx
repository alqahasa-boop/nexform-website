import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCompanies } from "@/features/companies/companies.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Companies" };
export const dynamic = "force-dynamic";

type CompanyRow = Awaited<ReturnType<typeof listCompanies>>[number];

export default async function CompaniesPage() {
  await requirePermission("companies:view");
  const companies = await listCompanies();

  const columns: DataTableColumn<CompanyRow>[] = [
    {
      key: "name",
      header: "Company",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.categories.map((c) => c.category.name).join(", ") || "Uncategorized"}</p>
        </div>
      ),
    },
    { key: "approval", header: "Approval", render: (row) => <StatusBadge status={row.approvalStatus} /> },
    { key: "verification", header: "Verification", render: (row) => <StatusBadge status={row.verificationStatus} /> },
    {
      key: "featured",
      header: "Featured",
      render: (row) => (row.featured ? <Badge>Featured</Badge> : <span className="text-muted-foreground">—</span>),
    },
    { key: "views", header: "Profile Views", render: (row) => <span className="tabular-nums text-muted-foreground">{row.profileViews}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Companies"
        description="Directory of partner companies shown across the site."
        actions={
          <Button render={<Link href="/admin/companies/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Company
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={companies}
        emptyTitle="No companies yet"
        rowActions={(row) => (
          <Link href={`/admin/companies/${row.id}`} className="text-sm font-medium text-primary hover:underline">
            Manage
          </Link>
        )}
      />
    </div>
  );
}
