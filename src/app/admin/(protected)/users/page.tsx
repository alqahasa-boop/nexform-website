import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin-session";
import { listUsers } from "@/features/users/users.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminSearchInput } from "@/components/admin/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/admin/user-avatar";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

type UserRow = Awaited<ReturnType<typeof listUsers>>["items"][number];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await requirePermission("users:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await listUsers({ page, search: params.search });

  const columns: DataTableColumn<UserRow>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={row.name} email={row.email} image={row.image} />
          <div>
            <p className="font-medium text-foreground">{row.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length === 0 ? (
            <span className="text-muted-foreground">No role</span>
          ) : (
            row.roles.map((ur) => (
              <Badge key={ur.roleId} variant="secondary">
                {ur.role.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.isActive ? "default" : "destructive"}>{row.isActive ? "Active" : "Suspended"}</Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      render: (row) => <span className="text-muted-foreground">{row.lastLoginAt ? row.lastLoginAt.toLocaleDateString() : "Never"}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Manage administrator and customer accounts."
        actions={
          <Button render={<Link href="/admin/users/new" />} nativeButton={false}>
            <Plus className="size-4" />
            Invite User
          </Button>
        }
      />

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by name or email…" />
      </div>

      <DataTable
        columns={columns}
        rows={result.items}
        emptyTitle="No users found"
        rowActions={(row) => (
          <Link href={`/admin/users/${row.id}`} className="text-sm font-medium text-primary hover:underline">
            Manage
          </Link>
        )}
      />
      <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
