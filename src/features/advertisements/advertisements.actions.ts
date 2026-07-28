"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import {
  createCampaign,
  updateCampaign,
  submitCampaignForApproval,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
  createCreative,
  assignCreativeToPlacement,
  recordAdImpression,
  recordAdClick,
} from "./advertisements.repository";
import { createCampaignSchema, createCreativeSchema, assignCreativeToPlacementSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createCampaignAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("advertisements:create");
    const parsed = createCampaignSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    if (parsed.data.startDate && parsed.data.endDate && parsed.data.startDate >= parsed.data.endDate) {
      return apiError("The end date must be after the start date.", "INVALID_DATES");
    }

    const campaign = await createCampaign(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "AdvertisementCampaign", entityId: campaign.id });
    revalidatePath("/admin/advertisements");
    return apiSuccess({ id: campaign.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function submitCampaignForApprovalAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("advertisements:update");
    await submitCampaignForApproval(id);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "AdvertisementCampaign", entityId: id, metadata: { submitted: true } });
    revalidatePath(`/admin/advertisements/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function approveCampaignAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("advertisements:manage");
    await approveCampaign(id, user.id);
    await recordActivity({ userId: user.id, action: "APPROVE", entityType: "AdvertisementCampaign", entityId: id });
    revalidatePath("/admin/advertisements");
    revalidatePath(`/admin/advertisements/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function rejectCampaignAction(id: string, reason: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("advertisements:manage");
    await rejectCampaign(id, reason);
    await recordActivity({ userId: user.id, action: "REJECT", entityType: "AdvertisementCampaign", entityId: id, metadata: { reason } });
    revalidatePath("/admin/advertisements");
    revalidatePath(`/admin/advertisements/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function setCampaignStatusAction(id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED"): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("advertisements:manage");
    await updateCampaign(id, { status });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "AdvertisementCampaign", entityId: id, metadata: { status } });
    revalidatePath("/admin/advertisements");
    revalidatePath(`/admin/advertisements/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function createCreativeAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("advertisements:update");
    const parsed = createCreativeSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const creative = await createCreative(parsed.data);
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "AdvertisementCreative", entityId: creative.id });
    revalidatePath(`/admin/advertisements/${parsed.data.campaignId}`);
    return apiSuccess({ id: creative.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteCampaignAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("advertisements:delete");
    await deleteCampaign(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "AdvertisementCampaign", entityId: id });
    revalidatePath("/admin/advertisements");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function assignCreativeToPlacementAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("advertisements:update");
    const parsed = assignCreativeToPlacementSchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const assignment = await assignCreativeToPlacement(parsed.data);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "AdvertisementCampaignPlacement", entityId: assignment.id });
    revalidatePath(`/admin/advertisements/${parsed.data.campaignId}`);
    return apiSuccess({ id: assignment.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

/** Public — called from the site's AdSlot component. No auth: any visitor triggers an impression/click. */
export async function recordAdImpressionAction(creativeId: string): Promise<ApiResult<null>> {
  await recordAdImpression(creativeId);
  return apiSuccess(null);
}

export async function recordAdClickAction(creativeId: string): Promise<ApiResult<null>> {
  await recordAdClick(creativeId);
  return apiSuccess(null);
}
