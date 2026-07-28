import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/admin-session";
import { listNotifications } from "@/features/notifications/notifications.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NotificationsMarkAllButton } from "./mark-all-button";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getAdminSession();
  const notifications = user ? await listNotifications(user.id) : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="System alerts and updates relevant to your account."
        actions={unreadCount > 0 ? <NotificationsMarkAllButton /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {notifications.map((n) => (
            <li key={n.id} className={`flex items-start gap-3 p-4 ${!n.isRead ? "bg-primary/5" : ""}`}>
              {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant="outline">{n.type.replace(/_/g, " ")}</Badge>
                </div>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
