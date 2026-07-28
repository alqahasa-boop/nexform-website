import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCategories } from "@/features/categories/categories.repository";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CompanyForm } from "@/components/admin/company-form";
import { CompanyStatusActions } from "./company-status-actions";

export const metadata: Metadata = { title: "Manage Company" };
export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("companies:view");
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: { logo: true, categories: { include: { category: true } } },
  });
  if (!company) notFound();

  const categories = await listCategories("COMPANY");

  return (
    <div>
      <AdminPageHeader
        title={company.name}
        description={company.website ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={company.approvalStatus} />
            <StatusBadge status={company.verificationStatus} />
          </div>
        }
      />

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Approval & Verification</h2>
        <CompanyStatusActions id={company.id} />
      </div>

      <CompanyForm
        initialData={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          description: company.description ?? "",
          website: company.website ?? "",
          whatsapp: company.whatsapp ?? "",
          phone: company.phone ?? "",
          email: company.email ?? "",
          address: company.address ?? "",
          logo: company.logo ? { id: company.logo.id, url: company.logo.url } : null,
          categoryIds: company.categories.map((c) => c.categoryId),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
