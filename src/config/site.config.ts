/** Central site configuration — reads env where relevant, typed defaults everywhere else. */
export const siteConfig = {
  name: "NEXFORM",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultLocale: "en" as const,
  locales: ["en", "ar"] as const,
  supportEmail: "hello@nexform.com",
};

export type Locale = (typeof siteConfig.locales)[number];
