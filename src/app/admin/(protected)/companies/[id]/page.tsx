import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCategories } from "@/features/categories/categories.repository";
import { listListingPackages } from "@/features/companies/companies.repository";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CompanyForm } from "@/components/admin/company-form";
import { CompanyStatusActions } from "./company-status-actions";
import { CompanyPackageAssignment } from "./company-package-assignment";

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

  const [categories, packages] = await Promise.all([listCategories("COMPANY"), listListingPackages()]);

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

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Directory Listing Package</h2>
        <CompanyPackageAssignment
          companyId={company.id}
          packages={packages.map((p) => ({ id: p.id, name: p.name }))}
          initialPackageId={company.listingPackageId}
          initialExpiresAt={company.packageExpiresAt ? company.packageExpiresAt.toISOString().slice(0, 10) : null}
        />
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
