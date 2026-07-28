"use client";

import { createContext, useContext } from "react";
import type { AuthenticatedUser } from "@/types/rbac";
import { hasPermission, hasAnyPermission, hasRole } from "@/types/rbac";
import type { PermissionKey } from "@/config/permissions.config";

const AdminUserContext = createContext<AuthenticatedUser | null>(null);

/** Makes the server-resolved session available to client components (sidebar, guards, forms). */
export function AdminUserProvider({
  user,
  children,
}: {
  user: AuthenticatedUser;
  children: React.ReactNode;
}) {
  return <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>;
}

export function useAdminUser(): AuthenticatedUser {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUser must be used within an AdminUserProvider");
  return ctx;
}

export function useHasPermission(permission: PermissionKey): boolean {
  return hasPermission(useAdminUser(), permission);
}

export function useHasAnyPermission(permissions: PermissionKey[]): boolean {
  return hasAnyPermission(useAdminUser(), permissions);
}

/**
 * Client-side UI hint only (hide/show a button) — every mutation this guards must
 * ALSO be enforced server-side via `requirePermission`/`assertPermission`. Never
 * rely on this alone.
 */
export function PermissionGuard({
  permission,
  anyOf,
  roles,
  fallback = null,
  children,
}: {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  roles?: Parameters<typeof hasRole>[1][];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const user = useAdminUser();
  const allowed =
    (permission ? hasPermission(user, permission) : true) &&
    (anyOf ? hasAnyPermission(user, anyOf) : true) &&
    (roles ? hasRole(user, ...roles) : true);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
