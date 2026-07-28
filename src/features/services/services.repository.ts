import { db } from "@/lib/db";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateServiceInput, UpdateServiceInput } from "./types";

export function listServices(params: PaginationParams & { language?: string } = {}) {
  const where = { deletedAt: null, ...(params.language && { language: params.language }) };

  return db.$transaction(async (tx) => {
    const total = await tx.service.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.service.findMany({
      where,
      skip,
      take,
      include: { category: true, coverImage: true },
      orderBy: { order: "asc" },
    });
    return { items, ...meta };
  });
}

/** Public-facing accessor — only published, publicly-visible, non-deleted rows, in display order. */
export function listPublishedServices(language: string) {
  return db.service.findMany({
    where: { language, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
    include: { coverImage: true },
    orderBy: { order: "asc" },
  });
}

export function getServiceBySlug(language: string, slug: string) {
  return db.service.findUnique({ where: { language_slug: { language, slug } }, include: { category: true, coverImage: true } });
}

export function createService(input: CreateServiceInput) {
  return db.service.create({ data: input });
}

export function updateService(id: string, input: UpdateServiceInput) {
  return db.service.update({ where: { id }, data: input });
}

export function publishService(id: string) {
  return db.service.update({ where: { id }, data: { status: "PUBLISHED" } });
}

export function deleteService(id: string) {
  return db.service.update({ where: { id }, data: { deletedAt: new Date() } });
}
