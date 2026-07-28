import { db } from "@/lib/db";
import type { MediaKind } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateFolderInput, CreateMediaAssetInput, UpdateMediaAssetInput } from "./types";

export function listMediaAssets(
  params: PaginationParams & { kind?: MediaKind; folderId?: string; tagId?: string; search?: string } = {}
) {
  const where = {
    ...(params.kind && { kind: params.kind }),
    ...(params.folderId && { folderId: params.folderId }),
    ...(params.tagId && { tags: { some: { tagId: params.tagId } } }),
    ...(params.search && { fileName: { contains: params.search, mode: "insensitive" as const } }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.mediaAsset.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.mediaAsset.findMany({
      where,
      skip,
      take,
      include: { folder: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

export function getMediaAssetById(id: string) {
  return db.mediaAsset.findUnique({
    where: { id },
    include: { folder: true, tags: { include: { tag: true } }, usages: true },
  });
}

export function createMediaAsset(input: CreateMediaAssetInput) {
  return db.mediaAsset.create({ data: input });
}

/** Uploading a replacement keeps the same asset id (and every existing reference) — only the file changes. */
export function replaceMediaAssetFile(id: string, replacement: Pick<CreateMediaAssetInput, "url" | "mimeType" | "sizeBytes" | "width" | "height">) {
  return db.mediaAsset.update({ where: { id }, data: replacement });
}

export function updateMediaAsset(id: string, input: UpdateMediaAssetInput) {
  return db.mediaAsset.update({ where: { id }, data: input });
}

export function deleteMediaAsset(id: string) {
  return db.mediaAsset.delete({ where: { id } });
}

export function recordMediaUsage(mediaAssetId: string, entityType: string, entityId: string) {
  return db.mediaUsage.create({ data: { mediaAssetId, entityType, entityId } });
}

export function listMediaUsage(mediaAssetId: string) {
  return db.mediaUsage.findMany({ where: { mediaAssetId } });
}

export function createFolder(input: CreateFolderInput) {
  return db.mediaFolder.create({ data: input });
}

export function listFolders(parentId?: string | null) {
  return db.mediaFolder.findMany({ where: { parentId: parentId ?? null }, orderBy: { name: "asc" } });
}

export function createTag(name: string) {
  return db.mediaTag.create({ data: { name } });
}

export function listTags() {
  return db.mediaTag.findMany({ orderBy: { name: "asc" } });
}

export function tagMediaAsset(mediaAssetId: string, tagId: string) {
  return db.mediaAssetTag.upsert({
    where: { mediaAssetId_tagId: { mediaAssetId, tagId } },
    create: { mediaAssetId, tagId },
    update: {},
  });
}
