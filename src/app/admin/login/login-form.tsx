"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLanguage } from "@/components/admin/admin-language-provider";
import { adminLoginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const { t } = useAdminLanguage();
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
          aria-invalid={Boolean(state?.error)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          aria-invalid={Boolean(state?.error)}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {t.auth.invalidCredentials}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            {t.auth.signingIn}
          </>
        ) : (
          t.auth.signIn
        )}
      </Button>
    </form>
  );
}
