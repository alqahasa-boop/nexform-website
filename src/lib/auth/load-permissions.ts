import { db } from "@/lib/db";
import type { PermissionKey } from "@/config/permissions.config";
import { listAllPermissionKeys } from "@/config/permissions.config";
import type { AuthenticatedUser } from "@/types/rbac";

/**
 * Resolves a user's effective permission set for embedding in the session/JWT.
 * A user can hold multiple roles (`UserRole` is many-to-many) — the effective
 * permission set is the union across all of them.
 */
export async function loadUserPermissions(userId: string): Promise<AuthenticatedUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });

  if (!user) return null;

  const roleKeys = user.roles.map((ur) => ur.role.key);
  const isSuperAdmin = roleKeys.includes("SUPER_ADMIN");

  const permissions: PermissionKey[] = isSuperAdmin
    ? listAllPermissionKeys()
    : Array.from(
        new Set(
          user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key as PermissionKey))
        )
      );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleKeys,
    permissions,
  };
}
