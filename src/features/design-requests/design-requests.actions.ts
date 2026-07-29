"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { assertPermission, ForbiddenError, getAdminSession } from "@/lib/auth/admin-session";
import type { DesignRequestStatus } from "@/generated/prisma/client";
import {
  createDesignRequest,
  updateDesignRequestStatus,
  updateDesignRequest,
  addDesignRequestMessage,
  listDesignRequests,
} from "./design-requests.repository";
import { createDesignRequestSchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { dispatchNotification } from "@/services/notification-dispatch.service";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { toCsv } from "@/lib/csv";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

/**
 * Public entry point for the "request a quotation / contact an engineering office"
 * flow — the structured DesignRequest workflow the admin dashboard already fully
 * manages had no public submission path until now (only an admin-side repository
 * function existed). This is what any "connect with an engineering office" call to
 * action — AI-driven or not — should submit to, instead of a generic contact form,
 * so the office gets the structured service/budget/style/measurements context.
 */
export async function createDesignRequestAction(input: unknown): Promise<ApiResult<{ requestNumber: string }>> {
  const session = await getAdminSession();

  let rateKey = `design-request:user:${session?.id}`;
  if (!session) {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    rateKey = `design-request:ip:${ip}`;
  }
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.designRequestForm });
  if (!allowed) return apiError("Too many requests submitted — please wait a while and try again.", "RATE_LIMITED");

  const parsed = createDesignRequestSchema.safeParse(input);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

  const request = await createDesignRequest({ ...parsed.data, customerId: session?.id ?? parsed.data.customerId });
  await recordActivity({
    userId: session?.id,
    action: "CREATE",
    entityType: "DesignRequest",
    entityId: request.id,
    metadata: { source: "public", requestNumber: request.requestNumber },
  });
  revalidatePath("/admin/design-requests");
  revalidatePath("/admin");

  return apiSuccess({ requestNumber: request.requestNumber });
}

export async function changeDesignRequestStatusAction(id: string, status: DesignRequestStatus, note?: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designRequests:update");
    await updateDesignRequestStatus(id, status, user.id, note);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "DesignRequest", entityId: id, metadata: { status } });
    revalidatePath("/admin/design-requests");
    revalidatePath(`/admin/design-requests/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function assignDesignRequestAction(id: string, assignedToId: string | null): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designRequests:assign");
    await updateDesignRequest(id, { assignedToId });
    await recordActivity({ userId: user.id, action: "ASSIGN", entityType: "DesignRequest", entityId: id, metadata: { assignedToId } });
    if (assignedToId) {
      await dispatchNotification({
        userId: assignedToId,
        type: "DESIGN_REQUEST",
        title: "You were assigned a design request",
        link: `/admin/design-requests/${id}`,
      });
    }
    revalidatePath(`/admin/design-requests/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateDesignRequestPriorityAction(id: string, priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designRequests:update");
    await updateDesignRequest(id, { priority });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "DesignRequest", entityId: id, metadata: { priority } });
    revalidatePath(`/admin/design-requests/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function addInternalNoteAction(designRequestId: string, body: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("designRequests:update");
    if (!body.trim()) return apiError("Note cannot be empty.", "VALIDATION");
    await addDesignRequestMessage({ designRequestId, authorId: user.id, body, isInternal: true });
    revalidatePath(`/admin/design-requests/${designRequestId}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function exportDesignRequestsCsvAction(): Promise<ApiResult<{ csv: string; filename: string }>> {
  try {
    await assertPermission("designRequests:view");
    const { items } = await listDesignRequests({ page: 1, pageSize: 10000 });
    const csv = toCsv(items, [
      { key: "requestNumber", header: "Request #", value: (r) => r.requestNumber },
      { key: "fullName", header: "Name", value: (r) => r.fullName },
      { key: "email", header: "Email", value: (r) => r.email },
      { key: "phone", header: "Phone", value: (r) => r.phone ?? "" },
      { key: "status", header: "Status", value: (r) => r.status },
      { key: "priority", header: "Priority", value: (r) => r.priority },
      { key: "service", header: "Service", value: (r) => r.service?.title ?? "" },
      { key: "assignedTo", header: "Assigned To", value: (r) => r.assignedTo?.name ?? "" },
      { key: "createdAt", header: "Created At", value: (r) => r.createdAt.toISOString() },
    ]);
    return apiSuccess({ csv, filename: `design-requests-${Date.now()}.csv` });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
