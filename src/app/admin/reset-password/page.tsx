import type { Metadata } from "next";
import { AdminLanguageProvider } from "@/components/admin/admin-language-provider";
import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <AdminLanguageProvider>
      <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div dir="ltr">
              <Logo variant="compact" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Set Your Password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Choose a password for your NEXFORM admin account.</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {token ? <ResetPasswordForm token={token} /> : <p className="text-sm text-destructive">Missing reset token. Use the link from your email.</p>}
          </div>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
