"use client";

import Link from "next/link";
import { Menu, Languages, LogOut, User as UserIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { adminLogoutAction } from "@/lib/auth/logout-action";
import { AdminSidebarNav } from "./admin-sidebar-nav";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { UserAvatar } from "./user-avatar";
import { NotificationBell, type NotificationBellItem } from "./notification-bell";
import { useAdminUser } from "./admin-user-provider";
import { useAdminLanguage } from "./admin-language-provider";

export function AdminHeader({
  notifications,
  unreadCount,
}: {
  notifications: NotificationBellItem[];
  unreadCount: number;
}) {
  const user = useAdminUser();
  const { t, toggleLanguage } = useAdminLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />} nativeButton={true}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">{t.brand}</SheetTitle>
          <AdminSidebarNav />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <AdminBreadcrumbs />
      </div>

      <div className="ms-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" render={<Link href="/" target="_blank" />} nativeButton={false} aria-label="View public site">
          <ExternalLink className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
          <Languages className="size-4" />
        </Button>
        <ThemeToggle />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="ms-1 rounded-full" aria-label="Account menu" />} nativeButton={true}>
            <UserAvatar name={user.name} email={user.email} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium">{user.name ?? user.email}</span>
                <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/profile" />}>
              <UserIcon className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={adminLogoutAction}>
              <DropdownMenuItem render={<button type="submit" className="w-full" />} nativeButton={true} variant="destructive">
                <LogOut className="size-4" />
                {t.auth.logout}
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
