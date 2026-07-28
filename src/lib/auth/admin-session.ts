import { redirect } from "next/navigation";
import { auth } from "./auth";
import { hasPermission, hasAnyPermission, type AuthenticatedUser } from "@/types/rbac";
import type { PermissionKey } from "@/config/permissions.config";

/** Reads the current session without redirecting — use when "logged in or not" is a valid branch. */
export async function getAdminSession(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    roleKeys: session.user.roleKeys,
    permissions: session.user.permissions,
  };
}

/** Server Component guard — redirects unauthenticated visitors to /admin/login. */
export async function requireAdminSession(): Promise<AuthenticatedUser> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  return user;
}

/** Server Component guard — redirects to /admin/access-denied if the permission is missing. */
export async function requirePermission(permission: PermissionKey): Promise<AuthenticatedUser> {
  const user = await requireAdminSession();
  if (!hasPermission(user, permission)) redirect("/admin/access-denied");
  return user;
}

export async function requireAnyPermission(permissions: PermissionKey[]): Promise<AuthenticatedUser> {
  const user = await requireAdminSession();
  if (!hasAnyPermission(user, permissions)) redirect("/admin/access-denied");
  return user;
}

/** Thrown by `assertPermission` — server actions should catch this and return a structured ApiResult error. */
export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Server Action guard — throws instead of redirecting, so a mutation triggered from a
 * table row (no full page context) can return a structured error instead of navigating away.
 */
export async function assertPermission(permission: PermissionKey): Promise<AuthenticatedUser> {
  const user = await getAdminSession();
  if (!user) throw new ForbiddenError("You must be signed in to perform this action.");
  if (!hasPermission(user, permission)) throw new ForbiddenError();
  return user;
}
