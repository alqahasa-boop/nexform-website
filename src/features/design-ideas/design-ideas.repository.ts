import { db } from "@/lib/db";
import type { ContentStatus, DesignCategory, Prisma } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateDesignIdeaInput, UpdateDesignIdeaInput } from "./types";

export function listDesignIdeas(
  params: PaginationParams & { status?: ContentStatus; designCategory?: DesignCategory; language?: string } = {}
) {
  const where = {
    ...(params.status && { status: params.status }),
    ...(params.designCategory && { designCategory: params.designCategory }),
    ...(params.language && { language: params.language }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.designIdea.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.designIdea.findMany({
      where,
      skip,
      take,
      include: { category: true, coverImage: true, styles: { include: { style: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

/**
 * Real-inspiration matching for the AI Interior/Exterior Designer flows —
 * ranks published gallery items by how many of the given criteria they
 * satisfy (category, room type, any overlapping style, budget range),
 * rather than fabricating images. Simple overlap scoring, not ML: honest
 * about what it is.
 */
export async function findMatchingDesignIdeas(criteria: {
  language: string;
  categoryId?: string;
  roomType?: string;
  styleNames?: string[];
  budgetMin?: number;
  budgetMax?: number;
  limit?: number;
}) {
  const limit = criteria.limit ?? 6;
  const candidates = await db.designIdea.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      language: criteria.language,
      deletedAt: null,
    },
    include: { category: true, coverImage: true, styles: { include: { style: true } } },
    orderBy: { viewCount: "desc" },
    take: 60,
  });

  const styleNamesLower = new Set((criteria.styleNames ?? []).map((s) => s.toLowerCase()));

  const scored = candidates.map((idea) => {
    let score = 0;
    if (criteria.categoryId && idea.categoryId === criteria.categoryId) score += 2;
    if (criteria.roomType && idea.roomType?.toLowerCase() === criteria.roomType.toLowerCase()) score += 2;
    if (styleNamesLower.size > 0 && idea.styles.some((s) => styleNamesLower.has(s.style.name.toLowerCase()))) score += 2;
    if (criteria.budgetMin != null || criteria.budgetMax != null) {
      const min = idea.budgetMin ? Number(idea.budgetMin) : undefined;
      const max = idea.budgetMax ? Number(idea.budgetMax) : undefined;
      const overlaps =
        (min == null || criteria.budgetMax == null || min <= criteria.budgetMax) &&
        (max == null || criteria.budgetMin == null || max >= criteria.budgetMin);
      if (overlaps) score += 1;
    }
    return { idea, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || b.idea.viewCount - a.idea.viewCount)
    .slice(0, limit)
    .map((s) => s.idea);
}

/** Public-facing accessor — only published, publicly-visible, non-deleted rows. */
export function listPublishedDesignIdeas(language: string) {
  return db.designIdea.findMany({
    where: { language, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
    include: { category: true, coverImage: true, styles: { include: { style: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getDesignIdeaBySlug(language: string, slug: string) {
  return db.designIdea.findUnique({
    where: { language_slug: { language, slug } },
    include: {
      category: true,
      coverImage: true,
      styles: { include: { style: true } },
      galleryItems: { include: { mediaAsset: true }, orderBy: { order: "asc" } },
    },
  });
}

export function createDesignIdea(input: CreateDesignIdeaInput) {
  const { styleIds, dimensions, ...rest } = input;
  return db.designIdea.create({
    data: {
      ...rest,
      ...(dimensions && { dimensions: dimensions as Prisma.InputJsonValue }),
      ...(styleIds && { styles: { create: styleIds.map((styleId) => ({ styleId })) } }),
    },
  });
}

export function updateDesignIdea(id: string, input: UpdateDesignIdeaInput) {
  const { styleIds, dimensions, ...rest } = input;
  return db.designIdea.update({
    where: { id },
    data: {
      ...rest,
      ...(dimensions && { dimensions: dimensions as Prisma.InputJsonValue }),
      ...(styleIds && { styles: { deleteMany: {}, create: styleIds.map((styleId) => ({ styleId })) } }),
    },
  });
}

export function publishDesignIdea(id: string) {
  return db.designIdea.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
}

export function deleteDesignIdea(id: string) {
  return db.designIdea.delete({ where: { id } });
}

export function bulkPublishDesignIdeas(ids: string[]) {
  return db.designIdea.updateMany({ where: { id: { in: ids } }, data: { status: "PUBLISHED", publishedAt: new Date() } });
}

export function bulkDeleteDesignIdeas(ids: string[]) {
  return db.designIdea.deleteMany({ where: { id: { in: ids } } });
}

export function recordDesignIdeaView(id: string) {
  return db.designIdea.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}

export function recordDesignIdeaShare(id: string) {
  return db.designIdea.update({ where: { id }, data: { shareCount: { increment: 1 } } });
}

/** Toggles a save and keeps the denormalized `saveCount` cache in sync atomically. */
export async function toggleDesignIdeaSave(designIdeaId: string, userId: string) {
  const existing = await db.designIdeaSave.findUnique({
    where: { designIdeaId_userId: { designIdeaId, userId } },
  });

  if (existing) {
    await db.$transaction([
      db.designIdeaSave.delete({ where: { id: existing.id } }),
      db.designIdea.update({ where: { id: designIdeaId }, data: { saveCount: { decrement: 1 } } }),
    ]);
    return { saved: false };
  }

  await db.$transaction([
    db.designIdeaSave.create({ data: { designIdeaId, userId } }),
    db.designIdea.update({ where: { id: designIdeaId }, data: { saveCount: { increment: 1 } } }),
  ]);
  return { saved: true };
}
