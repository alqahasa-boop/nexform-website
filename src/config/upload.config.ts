import type { MediaKind } from "@/generated/prisma/client";

/**
 * Allowed MIME types, size ceilings, and file extensions per media kind — the single
 * source of truth for upload validation. `extensions` is required in addition to MIME
 * type for kinds whose files browsers commonly report as generic/ambiguous MIME types
 * (CAD formats like RVT/SKP have no registered MIME type and arrive as
 * `application/octet-stream`) — requiring both closes the "trust the extension alone"
 * gap without silently accepting arbitrary binaries.
 */
export const UPLOAD_RULES: Record<MediaKind, { mimeTypes: string[]; extensions: string[]; maxSizeBytes: number }> = {
  IMAGE: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
    extensions: ["jpg", "jpeg", "png", "webp", "avif", "svg"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
  PDF: {
    mimeTypes: ["application/pdf"],
    extensions: ["pdf"],
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
  },
  DOCUMENT: {
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "application/x-zip-compressed",
      // CAD / BIM formats — browsers rarely report a specific MIME type for these,
      // so `application/octet-stream` is allowed here ONLY in combination with a
      // matching extension (enforced in file-validation.ts), never on MIME alone.
      "application/dwg",
      "image/vnd.dwg",
      "application/acad",
      "image/vnd.dxf",
      "application/dxf",
      "application/octet-stream",
    ],
    extensions: ["doc", "docx", "xls", "xlsx", "zip", "dwg", "dxf", "rvt", "skp"],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB — CAD/BIM files run large
  },
  VIDEO: {
    mimeTypes: ["video/mp4", "video/webm"],
    extensions: ["mp4", "webm"],
    maxSizeBytes: 200 * 1024 * 1024, // 200 MB
  },
};
