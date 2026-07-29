import type { PermissionModule } from "./permissions.config";

/**
 * Data-only description of every admin dashboard module. The sidebar, route
 * guards, and permission checks are all driven from this single list so they
 * can never drift out of sync with each other. `group` controls sidebar
 * sectioning only — it carries no permission meaning.
 */
export type AdminModuleGroup = "overview" | "content" | "business" | "people" | "insights" | "system";

export interface AdminModuleConfig {
  id: string;
  label: string;
  path: string;
  permissionModule: PermissionModule;
  group: AdminModuleGroup;
}

export const ADMIN_MODULE_GROUP_LABELS: Record<AdminModuleGroup, string> = {
  overview: "Overview",
  content: "Content",
  business: "Business",
  people: "People & Access",
  insights: "Insights",
  system: "System",
};

export const ADMIN_MODULES: AdminModuleConfig[] = [
  { id: "dashboard", label: "Dashboard", path: "/admin", permissionModule: "dashboard", group: "overview" },

  { id: "content", label: "Content", path: "/admin/content", permissionModule: "content", group: "content" },
  { id: "media", label: "Media Library", path: "/admin/media", permissionModule: "media", group: "content" },
  { id: "projects", label: "Projects", path: "/admin/projects", permissionModule: "projects", group: "content" },
  {
    id: "design-ideas",
    label: "Design Ideas",
    path: "/admin/design-ideas",
    permissionModule: "designIdeas",
    group: "content",
  },
  { id: "services", label: "Services", path: "/admin/services", permissionModule: "content", group: "content" },
  {
    id: "construction-journey",
    label: "Construction Journey",
    path: "/admin/construction-journey",
    permissionModule: "constructionJourney",
    group: "content",
  },
  {
    id: "construction-library",
    label: "Construction Library",
    path: "/admin/construction-library",
    permissionModule: "constructionLibrary",
    group: "content",
  },
  { id: "faq", label: "FAQ", path: "/admin/faq", permissionModule: "faq", group: "content" },

  {
    id: "companies",
    label: "Companies",
    path: "/admin/companies",
    permissionModule: "companies",
    group: "business",
  },
  {
    id: "advertisements",
    label: "Advertisements",
    path: "/admin/advertisements",
    permissionModule: "advertisements",
    group: "business",
  },
  {
    id: "design-requests",
    label: "Design Requests",
    path: "/admin/design-requests",
    permissionModule: "designRequests",
    group: "business",
  },
  {
    id: "contact-messages",
    label: "Contact Messages",
    path: "/admin/contact-messages",
    permissionModule: "contactMessages",
    group: "business",
  },

  { id: "users", label: "Users", path: "/admin/users", permissionModule: "users", group: "people" },
  { id: "roles", label: "Roles & Permissions", path: "/admin/roles", permissionModule: "roles", group: "people" },

  { id: "analytics", label: "Analytics", path: "/admin/analytics", permissionModule: "analytics", group: "insights" },
  {
    id: "notifications",
    label: "Notifications",
    path: "/admin/notifications",
    permissionModule: "notifications",
    group: "insights",
  },
  {
    id: "activity-logs",
    label: "Activity Logs",
    path: "/admin/activity-logs",
    permissionModule: "activityLogs",
    group: "insights",
  },

  { id: "languages", label: "Languages", path: "/admin/languages", permissionModule: "languages", group: "system" },
  { id: "seo", label: "SEO", path: "/admin/seo", permissionModule: "seo", group: "system" },
  { id: "settings", label: "Settings", path: "/admin/settings", permissionModule: "settings", group: "system" },
  { id: "ai", label: "AI Management", path: "/admin/ai", permissionModule: "ai", group: "system" },
];
