import Link from "next/link";
import type { AuthenticatedUser } from "@/types/rbac";
import { Logo } from "@/components/logo";
import { AdminUserProvider } from "./admin-user-provider";
import { AdminLanguageProvider } from "./admin-language-provider";
import { AdminSidebarNav } from "./admin-sidebar-nav";
import { AdminHeader } from "./admin-header";
import type { NotificationBellItem } from "./notification-bell";
import type { AdminLanguage } from "@/lib/admin/admin-translations";

export function AdminShell({
  user,
  notifications,
  unreadCount,
  initialLanguage,
  children,
}: {
  user: AuthenticatedUser;
  notifications: NotificationBellItem[];
  unreadCount: number;
  initialLanguage: AdminLanguage;
  children: React.ReactNode;
}) {
  return (
    <AdminUserProvider user={user}>
      <AdminLanguageProvider initialLanguage={initialLanguage}>
        <div className="flex min-h-svh bg-muted/20">
          <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-background lg:flex">
            <div className="flex h-14 items-center border-b border-border px-4" dir="ltr">
              <Link href="/admin" className="flex items-center">
                <Logo variant="compact" className="w-28" />
              </Link>
            </div>
            <AdminSidebarNav />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader notifications={notifications} unreadCount={unreadCount} />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </AdminLanguageProvider>
    </AdminUserProvider>
  );
}
