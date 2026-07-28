"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { createCompany, updateCompany, deleteCompany } from "./companies.repository";
import { createCompanySchema, updateCompanySchema } from "./types";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { db } from "@/lib/db";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export async function createCompanyAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const user = await assertPermission("companies:create");
    const parsed = createCompanySchema.omit({ createdById: true }).safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const existing = await db.company.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    if (existing) return apiError("A company with this slug already exists.", "DUPLICATE_SLUG");

    const company = await createCompany({ ...parsed.data, createdById: user.id });
    await recordActivity({ userId: user.id, action: "CREATE", entityType: "Company", entityId: company.id });
    revalidatePath("/admin/companies");
    return apiSuccess({ id: company.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateCompanyAction(id: string, input: unknown): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("companies:update");
    const parsed = updateCompanySchema.safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    await updateCompany(id, parsed.data);
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "Company", entityId: id });
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function approveCompanyAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("companies:update");
    await updateCompany(id, { approvalStatus: "APPROVED" });
    await recordActivity({ userId: user.id, action: "APPROVE", entityType: "Company", entityId: id });
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function rejectCompanyAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("companies:update");
    await updateCompany(id, { approvalStatus: "REJECTED" });
    await recordActivity({ userId: user.id, action: "REJECT", entityType: "Company", entityId: id });
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function verifyCompanyAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("companies:update");
    await updateCompany(id, { verificationStatus: "VERIFIED" });
    await recordActivity({ userId: user.id, action: "UPDATE", entityType: "Company", entityId: id, metadata: { verified: true } });
    revalidatePath(`/admin/companies/${id}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteCompanyAction(id: string): Promise<ApiResult<null>> {
  try {
    const user = await assertPermission("companies:delete");
    await deleteCompany(id);
    await recordActivity({ userId: user.id, action: "DELETE", entityType: "Company", entityId: id });
    revalidatePath("/admin/companies");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
