import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCategories } from "@/features/categories/categories.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CompanyForm } from "@/components/admin/company-form";

export const metadata: Metadata = { title: "New Company" };
export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  await requirePermission("companies:create");
  const categories = await listCategories("COMPANY");

  return (
    <div>
      <AdminPageHeader title="New Company" description="Add a company to the directory." />
      <CompanyForm initialData={null} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
