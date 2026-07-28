import type { MediaKind } from "@/generated/prisma/client";
import { UPLOAD_RULES } from "@/config/upload.config";

export interface FileValidationInput {
  mimeType: string;
  sizeBytes: number;
  kind: MediaKind;
  fileName: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1]! : "";
}

/**
 * Whitelist-based validation — never trusts a client-supplied file extension or MIME
 * type alone. Both must match the allow-list for the claimed kind. This matters most
 * for CAD/BIM formats (RVT, SKP, DWG, DXF), which browsers frequently report with the
 * generic `application/octet-stream` MIME type — accepting that MIME type without also
 * requiring a matching extension would let literally any file through.
 */
export function validateUpload({ mimeType, sizeBytes, kind, fileName }: FileValidationInput): FileValidationResult {
  const rules = UPLOAD_RULES[kind];

  if (!rules.mimeTypes.includes(mimeType)) {
    return { valid: false, error: `MIME type "${mimeType}" is not allowed for ${kind} uploads.` };
  }

  const extension = getExtension(fileName);
  if (!rules.extensions.includes(extension)) {
    return { valid: false, error: `File extension ".${extension}" is not allowed for ${kind} uploads.` };
  }

  if (mimeType === "application/octet-stream" && !["dwg", "dxf", "rvt", "skp"].includes(extension)) {
    return { valid: false, error: "Generic binary files are only accepted for recognized CAD/BIM formats." };
  }

  if (sizeBytes > rules.maxSizeBytes) {
    const maxMb = Math.round(rules.maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `File exceeds the ${maxMb}MB limit for ${kind} uploads.` };
  }

  if (sizeBytes <= 0) {
    return { valid: false, error: "Empty file." };
  }

  return { valid: true };
}

/** Strips path separators and control characters so a filename can never escape its upload directory. */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^\w.\-() ]/g, "_")
    .slice(0, 200);
}
