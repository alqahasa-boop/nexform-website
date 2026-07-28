"use client";

import { useAdminLanguage } from "@/components/admin/admin-language-provider";

export function LoginHeading() {
  const { t } = useAdminLanguage();
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">{t.auth.loginTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>
    </div>
  );
}
