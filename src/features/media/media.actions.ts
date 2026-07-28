"use server";

import { revalidatePath } from "next/cache";
import type { MediaKind } from "@/generated/prisma/client";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { uploadFile, deleteFile } from "@/services/storage.service";
import { validateUpload, sanitizeFileName } from "@/lib/security/file-validation";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import {
  createMediaAsset,
  deleteMediaAsset,
  listMediaAssets,
  listMediaUsage,
} from "./media.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";
import { UPLOAD_RULES } from "@/config/upload.config";

function inferKindFromMimeType(mimeType: string): MediaKind | null {
  for (const [kind, rules] of Object.entries(UPLOAD_RULES) as [MediaKind, (typeof UPLOAD_RULES)[MediaKind]][]) {
    if (rules.mimeTypes.includes(mimeType)) return kind;
  }
  return null;
}

export interface UploadedMediaAsset {
  id: string;
  url: string;
  fileName: string;
  kind: MediaKind;
  mimeType: string;
}

export async function uploadMediaAction(formData: FormData): Promise<ApiResult<UploadedMediaAsset>> {
  try {
    const user = await assertPermission("media:create");

    const { allowed } = rateLimit({ key: `upload:${user.id}`, ...RATE_LIMIT_PRESETS.upload });
    if (!allowed) return apiError("Too many uploads — please wait a moment and try again.", "RATE_LIMITED");

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return apiError("No file provided.", "INVALID_INPUT");

    const kind = inferKindFromMimeType(file.type);
    if (!kind) return apiError(`File type "${file.type}" is not supported.`, "INVALID_INPUT");

    // Never trust the extension alone — the MIME type + size are validated against the allow-list.
    const validation = validateUpload({ mimeType: file.type, sizeBytes: file.size, kind });
    if (!validation.valid) return apiError(validation.error ?? "Invalid file.", "INVALID_INPUT");

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFileName(file.name);
    const uploaded = await uploadFile({ buffer, fileName: safeName, mimeType: file.type });

    const alt = formData.get("alt");
    const folderId = formData.get("folderId");

    const asset = await createMediaAsset({
      kind,
      fileName: safeName,
      url: uploaded.url,
      mimeType: file.type,
      sizeBytes: file.size,
      ...(typeof alt === "string" && alt && { alt }),
      ...(typeof folderId === "string" && folderId && { folderId }),
      uploadedById: user.id,
    });

    await recordActivity({ userId: user.id, action: "UPLOAD", entityType: "MediaAsset", entityId: asset.id });
    revalidatePath("/admin/media");

    return apiSuccess({ id: asset.id, url: asset.url, fileName: asset.fileName, kind: asset.kind, mimeType: asset.mimeType });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function listMediaForPickerAction(params: {
  kind?: MediaKind;
  search?: string;
  page?: number;
}): Promise<ApiResult<{ items: UploadedMediaAsset[]; totalPages: number }>> {
  try {
    await assertPermission("media:view");
    const result = await listMediaAssets({ kind: params.kind, search: params.search, page: params.page, pageSize: 24 });
    return apiSuccess({
      items: result.items.map((item) => ({ id: item.id, url: item.url, fileName: item.fileName, kind: item.kind, mimeType: item.mimeType })),
      totalPages: result.totalPages,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteMediaAssetAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("media:delete");

    const usages = await listMediaUsage(id);
    if (usages.length > 0) {
      return apiError(
        `This file is referenced in ${usages.length} place(s) and cannot be deleted. Remove those references first.`,
        "IN_USE"
      );
    }

    const asset = await deleteMediaAsset(id);
    await deleteFile(asset.url.replace(/^\/uploads\//, "")).catch(() => undefined);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "MediaAsset", entityId: id });
    revalidatePath("/admin/media");

    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
