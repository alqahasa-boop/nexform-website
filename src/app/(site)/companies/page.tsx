import type { Metadata } from "next";
import { CompaniesContent } from "@/components/pages/companies-content";
import { AdSlot } from "@/components/ad-slot";
import { listCompanies } from "@/features/companies/companies.repository";

export const metadata: Metadata = {
  title: "Companies Directory",
  description: "Verified contractors, suppliers, and specialists trusted by NEXFORM.",
};

export const revalidate = 60;

export default async function CompaniesPage() {
  const companies = await listCompanies(true);
  const now = new Date();

  const cards = companies.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    logoUrl: c.logo?.url ?? null,
    website: c.website,
    whatsapp: c.whatsapp,
    phone: c.phone,
    categories: c.categories.map((cc) => cc.category.name),
    featured: c.featured,
    packageName:
      c.listingPackage && (!c.packageExpiresAt || c.packageExpiresAt > now) ? c.listingPackage.name : null,
  }));

  return (
    <>
      <CompaniesContent companies={cards} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <AdSlot placementKey="companies-directory-banner" className="aspect-[6/1] w-full" />
      </div>
    </>
  );
}
