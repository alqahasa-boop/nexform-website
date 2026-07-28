"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Building2,
  Sparkles,
  Wrench,
  Route,
  Library,
  HelpCircle,
  Building,
  Megaphone,
  ClipboardList,
  Mail,
  Users,
  ShieldCheck,
  BarChart3,
  Bell,
  History,
  Languages,
  Search,
  Settings,
} from "lucide-react";
import {
  ADMIN_MODULES,
  ADMIN_MODULE_GROUP_LABELS,
  type AdminModuleGroup,
} from "@/config/admin-modules.config";
import type { PermissionKey } from "@/config/permissions.config";
import { hasPermission } from "@/types/rbac";
import { useAdminUser, useHasPermission } from "./admin-user-provider";
import { useAdminLanguage } from "./admin-language-provider";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  content: FileText,
  media: ImageIcon,
  projects: Building2,
  "design-ideas": Sparkles,
  services: Wrench,
  "construction-journey": Route,
  "construction-library": Library,
  faq: HelpCircle,
  companies: Building,
  advertisements: Megaphone,
  "design-requests": ClipboardList,
  "contact-messages": Mail,
  users: Users,
  roles: ShieldCheck,
  analytics: BarChart3,
  notifications: Bell,
  "activity-logs": History,
  languages: Languages,
  seo: Search,
  settings: Settings,
};

const GROUP_ORDER: AdminModuleGroup[] = ["overview", "content", "business", "people", "insights", "system"];

function toCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

/** One nav row — hidden entirely (not just visually) if the signed-in user lacks `<module>:view`. */
function GatedModuleLink({ moduleId, path, permissionModule }: { moduleId: string; path: string; permissionModule: string }) {
  const canView = useHasPermission(`${permissionModule}:view` as PermissionKey);
  const pathname = usePathname();
  const { t } = useAdminLanguage();

  if (!canView) return null;

  const label = (t.nav as Record<string, string>)[toCamel(moduleId)] ?? moduleId;
  const isActive = path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
  const Icon = MODULE_ICONS[moduleId] ?? FileText;

  return (
    <Link
      href={path}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function GroupSection({ group }: { group: AdminModuleGroup }) {
  const user = useAdminUser();
  const modules = ADMIN_MODULES.filter((m) => m.group === group);
  const hasAnyVisible = modules.some((m) => hasPermission(user, `${m.permissionModule}:view` as PermissionKey));

  if (!hasAnyVisible) return null;

  return (
    <div>
      <p className="px-3 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {ADMIN_MODULE_GROUP_LABELS[group]}
      </p>
      <div className="flex flex-col gap-0.5">
        {modules.map((mod) => (
          <GatedModuleLink key={mod.id} moduleId={mod.id} path={mod.path} permissionModule={mod.permissionModule} />
        ))}
      </div>
    </div>
  );
}

export function AdminSidebarNav() {
  const { t } = useAdminLanguage();

  return (
    <nav aria-label={t.brand} className="flex flex-col gap-5 overflow-y-auto px-3 py-4">
      {GROUP_ORDER.map((group) => (
        <GroupSection key={group} group={group} />
      ))}
    </nav>
  );
}
