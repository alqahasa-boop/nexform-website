import { db } from "@/lib/db";
import type { PermissionKey } from "@/config/permissions.config";

export function listRoles() {
  return db.role.findMany({ include: { _count: { select: { users: true } } }, orderBy: { name: "asc" } });
}

export function getRoleById(id: string) {
  return db.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } }, users: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
}

export function getRoleByKey(key: Parameters<typeof db.role.findUnique>[0]["where"]["key"]) {
  return db.role.findUnique({ where: { key }, include: { permissions: { include: { permission: true } } } });
}

// NOTE: `Role.key` is a required, unique `SystemRoleKey` enum value by design (it's what lets
// `load-permissions.ts` do a cheap, safe "is this user a Super Admin" check). That means every
// row in this table must be one of the fixed system roles — there is currently no supported way
// to create an arbitrary custom role. Enabling that is a real schema change (`key` would need to
// become optional, with every `role.key` reader updated to handle `null`), not something to paper
// over with an unsafe cast — flagged here as a deliberate, documented gap rather than built unsafely.

export function listPermissions() {
  return db.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] });
}

export async function setRolePermissions(roleId: string, permissionKeys: PermissionKey[]) {
  const permissions = await db.permission.findMany({ where: { key: { in: permissionKeys } } });

  return db.$transaction([
    db.rolePermission.deleteMany({ where: { roleId } }),
    db.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId, permissionId: permission.id })),
    }),
  ]);
}
