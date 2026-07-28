import { db } from "@/lib/db";
import type { ContentStatus, ContentType } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateContentInput, UpdateContentInput } from "./types";

export function listContent(
  params: PaginationParams & {
    contentType?: ContentType;
    status?: ContentStatus;
    language?: string;
    search?: string;
  } = {}
) {
  const where = {
    ...(params.contentType && { contentType: params.contentType }),
    ...(params.status && { status: params.status }),
    ...(params.language && { language: params.language }),
    ...(params.search && { title: { contains: params.search, mode: "insensitive" as const } }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.content.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.content.findMany({
      where,
      skip,
      take,
      include: { category: true, coverImage: true, author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

export function getContentBySlug(contentType: ContentType, language: string, slug: string) {
  return db.content.findUnique({
    where: { contentType_language_slug: { contentType, language, slug } },
    include: { category: true, coverImage: true, author: { select: { id: true, name: true } } },
  });
}

/** All language versions sharing the same `translationGroupId` (e.g. the EN + AR pair). */
export function getContentTranslations(translationGroupId: string) {
  return db.content.findMany({ where: { translationGroupId }, orderBy: { language: "asc" } });
}

export function createContent(input: CreateContentInput) {
  return db.content.create({ data: input });
}

export function updateContent(id: string, input: UpdateContentInput) {
  return db.content.update({ where: { id }, data: input });
}

export function publishContent(id: string) {
  return db.content.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
}

export function deleteContent(id: string) {
  return db.content.delete({ where: { id } });
}

export function bulkPublishContent(ids: string[]) {
  return db.content.updateMany({ where: { id: { in: ids } }, data: { status: "PUBLISHED", publishedAt: new Date() } });
}

export function bulkArchiveContent(ids: string[]) {
  return db.content.updateMany({ where: { id: { in: ids } }, data: { status: "ARCHIVED" } });
}

export function bulkDeleteContent(ids: string[]) {
  return db.content.deleteMany({ where: { id: { in: ids } } });
}
