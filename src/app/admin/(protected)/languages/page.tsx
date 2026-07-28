import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listLanguages } from "@/features/languages/languages.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { LanguageControls } from "./language-controls";

export const metadata: Metadata = { title: "Languages" };
export const dynamic = "force-dynamic";

export default async function LanguagesPage() {
  await requirePermission("languages:view");
  const languages = await listLanguages(false);

  return (
    <div>
      <AdminPageHeader title="Languages" description="Supported content languages for NEXFORM." />
      <div className="divide-y divide-border rounded-xl border border-border">
        {languages.map((lang) => (
          <div key={lang.code} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">
                {lang.name} <span className="text-muted-foreground">({lang.nativeName})</span>
              </p>
              <p className="text-xs uppercase text-muted-foreground">{lang.code} · {lang.direction}</p>
            </div>
            <LanguageControls code={lang.code} isActive={lang.isActive} isDefault={lang.isDefault} />
          </div>
        ))}
      </div>
    </div>
  );
}
