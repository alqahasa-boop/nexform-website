import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { AdminLanguageProvider } from "@/components/admin/admin-language-provider";
import { AccessDeniedContent } from "./access-denied-content";

export const metadata: Metadata = { title: "Access Denied", robots: { index: false, follow: false } };

export default async function AccessDeniedPage() {
  // Must be logged in to even reach this page (middleware gates /admin/*); this only
  // confirms the session exists, it doesn't require any specific permission.
  await requireAdminSession();

  return (
    <AdminLanguageProvider>
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <ShieldAlert className="size-12 text-destructive" aria-hidden="true" />
          <AccessDeniedContent />
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
