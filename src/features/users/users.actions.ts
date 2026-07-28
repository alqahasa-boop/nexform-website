"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, ForbiddenError, getAdminSession } from "@/lib/auth/admin-session";
import {
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  revokeUserSessions,
  countSuperAdmins,
  userHasRole,
  getUserById,
} from "./users.repository";
import { createUserSchema } from "./types";
import { createPasswordResetToken } from "@/lib/auth/tokens";
import { sendEmail, renderPasswordResetEmail } from "@/services/email.service";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Admin-initiated account creation: no password is set by the admin — the new user sets their own via emailed link. */
export async function inviteUserAction(input: unknown): Promise<ApiResult<{ id: string }>> {
  try {
    const actor = await assertPermission("users:create");
    const parsed = createUserSchema.omit({ password: true }).safeParse(input);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION");

    const user = await createUser(parsed.data);
    await recordActivity({ userId: actor.id, action: "CREATE", entityType: "User", entityId: user.id });

    const { token } = await createPasswordResetToken(user.id);
    await sendEmail({
      to: user.email,
      subject: "You've been invited to NEXFORM Admin",
      html: renderPasswordResetEmail(`${siteUrl}/admin/reset-password?token=${token}`),
    });

    revalidatePath("/admin/users");
    return apiSuccess({ id: user.id });
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function updateUserRolesAction(userId: string, roleIds: string[]): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:manage");

    const wasSuperAdmin = await userHasRole(userId, "SUPER_ADMIN");
    if (wasSuperAdmin) {
      const remainingSuperAdmins = await countSuperAdmins();
      // If this user is currently the only Super Admin, refuse any role change that could drop them.
      if (remainingSuperAdmins <= 1) {
        return apiError("Cannot change roles for the only remaining Super Admin.", "LAST_SUPER_ADMIN");
      }
    }

    await updateUser(userId, { roleIds });
    await recordActivity({ userId: actor.id, action: "PERMISSION_CHANGE", entityType: "User", entityId: userId, metadata: { roleIds } });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function suspendUserAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:suspend");

    const isSuperAdmin = await userHasRole(userId, "SUPER_ADMIN");
    if (isSuperAdmin) {
      const remainingSuperAdmins = await countSuperAdmins();
      if (remainingSuperAdmins <= 1) return apiError("Cannot suspend the only remaining Super Admin.", "LAST_SUPER_ADMIN");
    }

    await deactivateUser(userId);
    await revokeUserSessions(userId);
    await recordActivity({ userId: actor.id, action: "UPDATE", entityType: "User", entityId: userId, metadata: { suspended: true } });
    revalidatePath("/admin/users");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function reactivateUserAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:suspend");
    await reactivateUser(userId);
    await recordActivity({ userId: actor.id, action: "UPDATE", entityType: "User", entityId: userId, metadata: { suspended: false } });
    revalidatePath("/admin/users");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function initiatePasswordResetAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:manage");
    const user = await getUserById(userId);
    if (!user) return apiError("User not found.", "NOT_FOUND");

    const { token } = await createPasswordResetToken(userId);
    await sendEmail({
      to: user.email,
      subject: "Reset your NEXFORM Admin password",
      html: renderPasswordResetEmail(`${siteUrl}/admin/reset-password?token=${token}`),
    });
    await recordActivity({ userId: actor.id, action: "UPDATE", entityType: "User", entityId: userId, metadata: { passwordResetInitiated: true } });
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function revokeUserSessionsAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:manage");
    await revokeUserSessions(userId);
    await recordActivity({ userId: actor.id, action: "UPDATE", entityType: "User", entityId: userId, metadata: { sessionsRevoked: true } });
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}

export async function deleteUserAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await assertPermission("users:delete");

    const currentSession = await getAdminSession();
    if (currentSession?.id === userId) return apiError("You cannot delete your own account.", "SELF_DELETE");

    const isSuperAdmin = await userHasRole(userId, "SUPER_ADMIN");
    if (isSuperAdmin) {
      const remainingSuperAdmins = await countSuperAdmins();
      if (remainingSuperAdmins <= 1) return apiError("Cannot delete the only remaining Super Admin.", "LAST_SUPER_ADMIN");
    }

    await deleteUser(userId);
    await revokeUserSessions(userId);
    await recordActivity({ userId: actor.id, action: "DELETE", entityType: "User", entityId: userId });
    revalidatePath("/admin/users");
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
