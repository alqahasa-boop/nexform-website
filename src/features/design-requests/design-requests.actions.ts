"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import type { DesignRequestStatus } from "@/generated/prisma/client";
import {
  updateDesignRequestStatus,
  updateDesignRequest,
  addDesignRequestMessage,
  listDesignRequests,
} from "./design-requests.repository";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { dispatchNotification } from "@/services/notification-dispatch.service";
import { toCsv } from "@/lib/csv";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

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
