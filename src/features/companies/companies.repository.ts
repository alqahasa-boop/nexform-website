import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateCompanyInput, UpdateCompanyInput } from "./types";

export function listCompanies(activeOnly = false) {
  return db.company.findMany({
    where: activeOnly ? { isActive: true, approvalStatus: "APPROVED" } : undefined,
    include: { logo: true, categories: { include: { category: true } }, listingPackage: true },
    orderBy: { name: "asc" },
  });
}

/**
 * AI Company Matching (Phase 6B) — ranks real, active, approved companies by
 * category overlap plus verification/featured/popularity signals. No rating
 * model exists in this schema, so `profileViews` is used as the only honest
 * popularity proxy available rather than inventing a fake star rating.
 */
export async function findMatchingCompanies(criteria: { categoryIds?: string[]; limit?: number }) {
  const limit = criteria.limit ?? 6;
  const companies = await db.company.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
      deletedAt: null,
      ...(criteria.categoryIds?.length && { categories: { some: { categoryId: { in: criteria.categoryIds } } } }),
    },
    include: { logo: true, categories: { include: { category: true } }, gallery: { include: { mediaAsset: true }, take: 4 } },
  });

  const categoryIdSet = new Set(criteria.categoryIds ?? []);

  const scored = companies.map((company) => {
    let score = 0;
    const overlap = company.categories.filter((c) => categoryIdSet.has(c.categoryId)).length;
    score += overlap * 3;
    if (company.verificationStatus === "VERIFIED") score += 2;
    if (company.featured) score += 2;
    return { company, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || b.company.profileViews - a.company.profileViews)
    .slice(0, limit)
    .map((s) => s.company);
}

export function listListingPackages() {
  return db.companyListingPackage.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export function getCompanyBySlug(slug: string) {
  return db.company.findUnique({
    where: { slug },
    include: {
      logo: true,
      categories: { include: { category: true } },
      gallery: { include: { mediaAsset: true } },
      listingPackage: true,
    },
  });
}

export function createCompany(input: CreateCompanyInput) {
  const { categoryIds, workingHours, socialLinks, ...rest } = input;
  return db.company.create({
    data: {
      ...rest,
      ...(workingHours && { workingHours: workingHours as Prisma.InputJsonValue }),
      ...(socialLinks && { socialLinks: socialLinks as Prisma.InputJsonValue }),
      ...(categoryIds && { categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } }),
    },
  });
}

export function updateCompany(id: string, input: UpdateCompanyInput) {
  const { categoryIds, workingHours, socialLinks, ...rest } = input;
  return db.company.update({
    where: { id },
    data: {
      ...rest,
      ...(workingHours && { workingHours: workingHours as Prisma.InputJsonValue }),
      ...(socialLinks && { socialLinks: socialLinks as Prisma.InputJsonValue }),
      ...(categoryIds && {
        categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) },
      }),
    },
  });
}

export function deleteCompany(id: string) {
  return db.company.delete({ where: { id } });
}

export function recordCompanyProfileView(id: string) {
  return db.company.update({ where: { id }, data: { profileViews: { increment: 1 } } });
}

export function recordCompanyContactClick(id: string) {
  return db.company.update({ where: { id }, data: { contactClicks: { increment: 1 } } });
}

export function recordCompanyWhatsappClick(id: string) {
  return db.company.update({ where: { id }, data: { whatsappClicks: { increment: 1 } } });
}
