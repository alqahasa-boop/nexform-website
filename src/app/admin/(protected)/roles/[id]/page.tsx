import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { getRoleById, listPermissions } from "@/features/users/roles.repository";
import { PERMISSION_MODULES, type PermissionKey, type PermissionModule } from "@/config/permissions.config";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RolePermissionMatrix } from "@/components/admin/role-permission-matrix";

export const metadata: Metadata = { title: "Edit Role" };
export const dynamic = "force-dynamic";

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("roles:view");
  const { id } = await params;

  const [role, allPermissions] = await Promise.all([getRoleById(id), listPermissions()]);
  if (!role) notFound();

  const permissionsByModule = Object.fromEntries(
    PERMISSION_MODULES.map((mod) => [
      mod,
      allPermissions.filter((p) => p.module === mod).map((p) => ({ key: p.key as PermissionKey, action: p.key.split(":")[1]! })),
    ])
  ) as Record<PermissionModule, { key: PermissionKey; action: string }[]>;

  return (
    <div>
      <AdminPageHeader title={role.name} description={role.description ?? undefined} />
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Assigned Users ({role.users.length})</h2>
        {role.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users currently hold this role.</p>
        ) : (
          <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {role.users.map((ur) => (
              <li key={ur.user.id} className="rounded-full bg-muted px-2.5 py-1">
                {ur.user.name ?? ur.user.email}
              </li>
            ))}
          </ul>
        )}
      </div>
      <RolePermissionMatrix
        roleId={role.id}
        roleName={role.name}
        isSystem={role.isSystem}
        permissionsByModule={permissionsByModule}
        grantedKeys={role.permissions.map((rp) => rp.permission.key as PermissionKey)}
      />
    </div>
  );
}
