import type { MediaKind } from "@/generated/prisma/client";

/** Allowed MIME types + size ceilings per media kind — the single source of truth for upload validation. */
export const UPLOAD_RULES: Record<MediaKind, { mimeTypes: string[]; maxSizeBytes: number }> = {
  IMAGE: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
  PDF: {
    mimeTypes: ["application/pdf"],
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
  },
  DOCUMENT: {
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/dwg",
      "image/vnd.dwg",
      "application/acad",
    ],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB — DWG/CAD files run large
  },
  VIDEO: {
    mimeTypes: ["video/mp4", "video/webm"],
    maxSizeBytes: 200 * 1024 * 1024, // 200 MB
  },
};
