/**
 * Locales the platform supports at the database/content level (Articles,
 * Projects, Design Ideas, ...). This is distinct from `src/lib/translations.ts`,
 * which holds the *static* site-chrome strings (nav, buttons) — that file is
 * intentionally left alone; this config seeds the `Language` table so future
 * CMS-managed content can be authored per locale without hardcoding "en"/"ar"
 * throughout the codebase.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", isDefault: true },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", isDefault: false },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
