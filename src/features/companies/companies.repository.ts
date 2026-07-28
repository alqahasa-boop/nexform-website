import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateCompanyInput, UpdateCompanyInput } from "./types";

export function listCompanies(activeOnly = false) {
  return db.company.findMany({
    where: activeOnly ? { isActive: true, approvalStatus: "APPROVED" } : undefined,
    include: { logo: true, categories: { include: { category: true } } },
    orderBy: { name: "asc" },
  });
}

export function getCompanyBySlug(slug: string) {
  return db.company.findUnique({
    where: { slug },
    include: { logo: true, categories: { include: { category: true } }, gallery: { include: { mediaAsset: true } } },
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
