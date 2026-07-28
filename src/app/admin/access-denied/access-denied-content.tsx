"use client";

import Link from "next/link";
import { useAdminLanguage } from "@/components/admin/admin-language-provider";
import { Button } from "@/components/ui/button";

export function AccessDeniedContent() {
  const { t } = useAdminLanguage();

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t.auth.accessDeniedTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.auth.accessDeniedBody}</p>
      </div>
      <Button render={<Link href="/admin" />} nativeButton={false}>
        {t.auth.backToDashboard}
      </Button>
    </>
  );
}
