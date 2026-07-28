import { requirePermission } from "@/lib/auth/admin-session";
import { listNotifications, countUnreadNotifications } from "@/features/notifications/notifications.repository";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Every /admin/** page below this layout requires, at minimum, dashboard:view —
  // finer-grained module permissions are then enforced per-page via requirePermission.
  const user = await requirePermission("dashboard:view");

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id).then((rows) => rows.slice(0, 8)),
    countUnreadNotifications(user.id),
  ]);

  return (
    <AdminShell
      user={user}
      initialLanguage="en"
      unreadCount={unreadCount}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))}
    >
      {children}
    </AdminShell>
  );
}
