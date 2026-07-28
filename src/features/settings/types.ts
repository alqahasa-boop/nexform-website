import { z } from "zod";

/** Known setting groups — keeps the admin UI's settings tabs and the DB rows in sync. */
export const SETTING_GROUPS = [
  "general",
  "contact",
  "social",
  "theme",
  "seo",
  "email",
  "storage",
  "maintenance",
] as const;
export type SettingGroup = (typeof SETTING_GROUPS)[number];

export const setSettingSchema = z.object({
  key: z.string().min(1).max(160),
  value: z.unknown(),
  group: z.enum(SETTING_GROUPS).optional(),
});
export type SetSettingInput = z.infer<typeof setSettingSchema>;

/** Well-known keys so callers get autocomplete instead of guessing strings. */
export const SETTING_KEYS = {
  siteName: "general.siteName",
  logoMediaId: "general.logoMediaId",
  faviconMediaId: "general.faviconMediaId",
  contactEmail: "contact.email",
  contactPhone: "contact.phone",
  contactAddress: "contact.address",
  socialLinks: "social.links",
  themeMode: "theme.mode",
  seoDefaultTitle: "seo.defaultTitle",
  seoDefaultDescription: "seo.defaultDescription",
  emailProvider: "email.provider",
  storageDriver: "storage.driver",
  maintenanceMode: "maintenance.enabled",
} as const;
