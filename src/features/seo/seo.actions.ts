"use server";

import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { setSeoMeta, getSeoMeta, type SeoMetaInput } from "./seo.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function upsertSeoMetaAction(input: SeoMetaInput): Promise<ApiResult<null>> {
  try {
    await assertPermission("seo:manage");
    if (input.canonicalUrl) {
      try {
        new URL(input.canonicalUrl);
      } catch {
        return apiError("Canonical URL must be a full, valid URL.", "INVALID_INPUT");
      }
    }
    await setSeoMeta(input);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function getSeoMetaAction(entityType: string, entityId: string) {
  return getSeoMeta(entityType, entityId);
}
