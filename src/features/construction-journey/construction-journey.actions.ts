"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { createJourneyStage, updateJourneyStage, deleteJourneyStage } from "./construction-journey.repository";
import { createJourneyStageSchema, updateJourneyStageSchema } from "./types";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createJourneyStageAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("constructionJourney:create");
    const parsed = createJourneyStageSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const stage = await createJourneyStage({
      ...parsed.data,
      ...(parsed.data.richContent && { richContent: sanitizeRichText(parsed.data.richContent) }),
    });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "ConstructionJourneyStage", entityId: stage.id });
    revalidatePath("/admin/construction-journey");
    return apiSuccess({ id: stage.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateJourneyStageAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionJourney:update");
    const parsed = updateJourneyStageSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await updateJourneyStage(id, {
      ...parsed.data,
      ...(parsed.data.richContent && { richContent: sanitizeRichText(parsed.data.richContent) }),
    });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "ConstructionJourneyStage", entityId: id });
    revalidatePath("/admin/construction-journey");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function publishJourneyStageAction(id: string, publish: boolean): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionJourney:publish");
    await updateJourneyStage(id, { status: publish ? "PUBLISHED" : "DRAFT" });
    await recordActivity({ userId: user.id, action: publish ? "PUBLISH" : "ARCHIVE", entityType: "ConstructionJourneyStage", entityId: id });
    revalidatePath("/admin/construction-journey");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteJourneyStageAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("constructionJourney:delete");
    await deleteJourneyStage(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "ConstructionJourneyStage", entityId: id });
    revalidatePath("/admin/construction-journey");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
