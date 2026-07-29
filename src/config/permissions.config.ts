import { SystemRoleKey } from "@/generated/prisma/client";

/**
 * Central permission registry — the single source of truth for what actions
 * exist in the system. Seeded verbatim into the `Permission` table; the admin
 * dashboard (Phase 2) reads this to render per-role permission toggles instead
 * of hardcoding checkboxes.
 */
export const PERMISSION_MODULES = [
  "dashboard",
  "content",
  "media",
  "projects",
  "designIdeas",
  "constructionJourney",
  "constructionLibrary",
  "faq",
  "companies",
  "advertisements",
  "users",
  "roles",
  "analytics",
  "settings",
  "notifications",
  "activityLogs",
  "languages",
  "seo",
  "designRequests",
  "contactMessages",
  "ai",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ["view", "create", "update", "delete", "publish", "manage", "assign", "suspend"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionKey = `${PermissionModule}:${PermissionAction}`;

/** Which actions are valid for each module. */
export const MODULE_PERMISSIONS: Record<PermissionModule, PermissionAction[]> = {
  dashboard: ["view"],
  content: ["view", "create", "update", "delete", "publish"],
  media: ["view", "create", "update", "delete"],
  projects: ["view", "create", "update", "delete", "publish"],
  designIdeas: ["view", "create", "update", "delete", "publish"],
  constructionJourney: ["view", "create", "update", "delete", "publish"],
  constructionLibrary: ["view", "create", "update", "delete", "publish"],
  faq: ["view", "create", "update", "delete", "publish"],
  companies: ["view", "create", "update", "delete"],
  advertisements: ["view", "create", "update", "delete", "manage"],
  users: ["view", "create", "update", "delete", "manage", "suspend"],
  roles: ["view", "manage"],
  analytics: ["view"],
  settings: ["view", "manage"],
  notifications: ["view", "manage"],
  activityLogs: ["view"],
  languages: ["view", "manage"],
  seo: ["view", "manage"],
  designRequests: ["view", "update", "manage", "assign"],
  contactMessages: ["view", "update", "manage"],
  ai: ["view", "manage"],
};

export function listAllPermissionKeys(): PermissionKey[] {
  return PERMISSION_MODULES.flatMap((mod) =>
    MODULE_PERMISSIONS[mod].map((action) => `${mod}:${action}` as PermissionKey)
  );
}

/**
 * Default role → permission grants, seeded on first `prisma db seed`.
 * Super Admin always has every permission (enforced in code, not listed here,
 * so newly added permissions are automatically covered without editing this map).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Exclude<SystemRoleKey, "SUPER_ADMIN">, PermissionKey[]> = {
  GUEST: [],
  CUSTOMER: ["designRequests:view"],
  EDITOR: [
    "dashboard:view",
    "content:view",
    "content:create",
    "content:update",
    "content:publish",
    "media:view",
    "media:create",
    "media:update",
    "faq:view",
    "faq:create",
    "faq:update",
    "faq:publish",
    "constructionJourney:view",
    "constructionJourney:create",
    "constructionJourney:update",
    "constructionJourney:publish",
    "constructionLibrary:view",
    "constructionLibrary:create",
    "constructionLibrary:update",
    "constructionLibrary:publish",
  ],
  DESIGN_MANAGER: [
    "dashboard:view",
    "projects:view",
    "projects:create",
    "projects:update",
    "projects:delete",
    "projects:publish",
    "designIdeas:view",
    "designIdeas:create",
    "designIdeas:update",
    "designIdeas:delete",
    "designIdeas:publish",
    "media:view",
    "media:create",
    "media:update",
    "media:delete",
    "designRequests:view",
    "designRequests:update",
    "designRequests:manage",
    "designRequests:assign",
  ],
  ADVERTISING_MANAGER: [
    "dashboard:view",
    "advertisements:view",
    "advertisements:create",
    "advertisements:update",
    "advertisements:delete",
    "advertisements:manage",
    "companies:view",
    "companies:create",
    "companies:update",
    "media:view",
    "media:create",
    "analytics:view",
  ],
  ANALYST: ["dashboard:view", "analytics:view", "activityLogs:view", "ai:view"],
  ADMIN: [
    ...PERMISSION_MODULES.flatMap(
      (mod) => MODULE_PERMISSIONS[mod].map((action) => `${mod}:${action}` as PermissionKey)
    ),
  ],
};
