import { db } from "@/lib/db";
import type { ContentStatus } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateProjectInput, GalleryItemInput, UpdateProjectInput } from "./types";

export function listProjects(
  params: PaginationParams & { status?: ContentStatus; categoryId?: string; language?: string } = {}
) {
  const where = {
    ...(params.status && { status: params.status }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.language && { language: params.language }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.project.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.project.findMany({
      where,
      skip,
      take,
      include: { category: true, coverImage: true },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

/** Public-facing accessor — only published, publicly-visible, non-deleted rows. */
export function listPublishedProjects(language: string) {
  return db.project.findMany({
    where: { language, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
    include: { category: true, coverImage: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getProjectBySlug(language: string, slug: string) {
  return db.project.findUnique({
    where: { language_slug: { language, slug } },
    include: {
      category: true,
      coverImage: true,
      galleryItems: { include: { mediaAsset: true }, orderBy: { order: "asc" } },
    },
  });
}

export function createProject(input: CreateProjectInput) {
  return db.project.create({ data: input });
}

export function updateProject(id: string, input: UpdateProjectInput) {
  return db.project.update({ where: { id }, data: input });
}

export function publishProject(id: string) {
  return db.project.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
}

export function deleteProject(id: string) {
  return db.project.delete({ where: { id } });
}

export function setProjectGallery(projectId: string, items: GalleryItemInput[]) {
  return db.$transaction([
    db.projectGalleryItem.deleteMany({ where: { projectId } }),
    db.projectGalleryItem.createMany({
      data: items.map((item) => ({ projectId, mediaAssetId: item.mediaAssetId, order: item.order })),
    }),
  ]);
}
