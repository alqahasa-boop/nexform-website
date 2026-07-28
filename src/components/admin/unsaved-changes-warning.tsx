"use client";

import { useEffect } from "react";
import { useAdminLanguage } from "./admin-language-provider";

/** Warns on a hard browser navigation/close/refresh while a form has unsaved edits. */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}

export function UnsavedChangesBanner({ isDirty }: { isDirty: boolean }) {
  const { t } = useAdminLanguage();
  useUnsavedChangesWarning(isDirty);

  if (!isDirty) return null;

  return (
    <div className="sticky top-14 z-20 mb-4 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
      {t.common.unsavedChanges}
    </div>
  );
}
