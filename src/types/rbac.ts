import type { SystemRoleKey } from "@/generated/prisma/client";
import type { PermissionKey } from "@/config/permissions.config";

/**
 * Minimal identity shape carried in the JWT/session — never the full User row.
 * `roleKeys` is an array because Phase 2 made User↔Role many-to-many (a user
 * can hold, e.g., both Editor and Advertising Manager at once).
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  roleKeys: SystemRoleKey[];
  permissions: PermissionKey[];
}

export function hasPermission(user: AuthenticatedUser | null | undefined, permission: PermissionKey): boolean {
  if (!user) return false;
  if (user.roleKeys.includes("SUPER_ADMIN")) return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthenticatedUser | null | undefined, permissions: PermissionKey[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function hasRole(user: AuthenticatedUser | null | undefined, ...roleKeys: SystemRoleKey[]): boolean {
  if (!user?.roleKeys.length) return false;
  return roleKeys.some((key) => user.roleKeys.includes(key));
}
