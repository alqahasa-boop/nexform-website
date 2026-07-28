import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { getSetting } from "@/features/settings/settings.repository";
import { SETTING_KEYS } from "@/features/settings/types";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission("settings:view");

  const [siteName, contactEmail, contactPhone, contactAddress, maintenanceMode] = await Promise.all([
    getSetting<string>(SETTING_KEYS.siteName),
    getSetting<string>(SETTING_KEYS.contactEmail),
    getSetting<string>(SETTING_KEYS.contactPhone),
    getSetting<string>(SETTING_KEYS.contactAddress),
    getSetting<boolean>(SETTING_KEYS.maintenanceMode),
  ]);

  return (
    <div>
      <AdminPageHeader title="Settings" description="General website configuration. API keys and secrets are managed via environment variables, not here." />
      <SettingsForm
        initial={{
          siteName: siteName ?? "NEXFORM",
          contactEmail: contactEmail ?? "",
          contactPhone: contactPhone ?? "",
          contactAddress: contactAddress ?? "",
          maintenanceMode: maintenanceMode ?? false,
        }}
      />
    </div>
  );
}
