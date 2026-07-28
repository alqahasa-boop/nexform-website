import type { MediaKind } from "@/generated/prisma/client";
import { UPLOAD_RULES } from "@/config/upload.config";

export interface FileValidationInput {
  mimeType: string;
  sizeBytes: number;
  kind: MediaKind;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** Whitelist-based validation — never trust a client-supplied file extension alone. */
export function validateUpload({ mimeType, sizeBytes, kind }: FileValidationInput): FileValidationResult {
  const rules = UPLOAD_RULES[kind];

  if (!rules.mimeTypes.includes(mimeType)) {
    return { valid: false, error: `MIME type "${mimeType}" is not allowed for ${kind} uploads.` };
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
