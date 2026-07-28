import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/admin-session";
import { listRoles } from "@/features/users/roles.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Roles & Permissions" };
export const dynamic = "force-dynamic";

type RoleRow = Awaited<ReturnType<typeof listRoles>>[number];

export default async function RolesPage() {
  await requirePermission("roles:view");
  const roles = await listRoles();

  const columns: DataTableColumn<RoleRow>[] = [
    { key: "name", header: "Role", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "key", header: "System Key", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.key}</span> },
    { key: "description", header: "Description", render: (r) => <span className="text-muted-foreground">{r.description ?? "—"}</span> },
    { key: "users", header: "Users", render: (r) => <Badge variant="secondary">{r._count.users}</Badge> },
  ];

  return (
    <div>
      <AdminPageHeader title="Roles & Permissions" description="Manage what each role in NEXFORM is allowed to do." />
      <DataTable
        columns={columns}
        rows={roles}
        emptyTitle="No roles found"
        rowActions={(role) => (
          <Button size="sm" variant="outline" render={<Link href={`/admin/roles/${role.id}`} />} nativeButton={false}>
            Edit Permissions
          </Button>
        )}
      />
    </div>
  );
}
