import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { AdminLanguageProvider } from "@/components/admin/admin-language-provider";
import { Logo } from "@/components/logo";
import { AdminLoginForm } from "./login-form";
import { LoginHeading } from "./login-heading";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <AdminLanguageProvider>
      <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div dir="ltr">
              <Logo variant="compact" />
            </div>
            <LoginHeading />
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
