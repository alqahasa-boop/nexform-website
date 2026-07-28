import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { getUserById } from "@/features/users/users.repository";
import { listRoles } from "@/features/users/roles.repository";
import { listActivityLogs } from "@/features/activity-logs/activity-logs.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { RoleEditor, AccountActions } from "./user-management-panel";

export const metadata: Metadata = { title: "Manage User" };
export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("users:view");
  const { id } = await params;

  const [user, roles, activity] = await Promise.all([
    getUserById(id),
    listRoles(),
    listActivityLogs({ userId: id, pageSize: 10 }),
  ]);
  if (!user) notFound();

  return (
    <div>
      <AdminPageHeader
        title={user.name ?? user.email}
        description={user.email}
        actions={<Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Suspended"}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <UserAvatar name={user.name} email={user.email} image={user.image} className="size-12" />
              <div>
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {user.emailVerified ? "Email verified" : "Email not verified"} · Last login:{" "}
                  {user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"}
                </p>
              </div>
            </div>
            <h2 className="mb-2 text-sm font-semibold">Account Actions</h2>
            <AccountActions userId={user.id} isActive={user.isActive} />
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
            <ActivityTimeline
              entries={activity.items.map((log) => ({
                id: log.id,
                action: log.action,
                entityType: log.entityType,
                createdAt: log.createdAt,
              }))}
            />
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Roles</h2>
          <RoleEditor
            userId={user.id}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
            initialRoleIds={user.roles.map((ur) => ur.roleId)}
          />
        </section>
      </div>
    </div>
  );
}
