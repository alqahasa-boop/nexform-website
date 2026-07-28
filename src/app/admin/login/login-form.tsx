"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLanguage } from "@/components/admin/admin-language-provider";
import { adminLoginAction, checkTwoFactorRequiredAction, type AdminLoginState } from "./actions";

export function AdminLoginForm() {
  const { t } = useAdminLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const submitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const precheck = await checkTwoFactorRequiredAction(email, password);
      if (precheck.error) {
        setError(precheck.error);
        return;
      }
      if (precheck.requiresTwoFactor) {
        setStep("code");
        return;
      }
      const result = await adminLoginAction(undefined, buildFormData({ email, password }));
      if (result?.error) setError(result.error);
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await adminLoginAction(undefined, buildFormData({ email, password, code }));
      if (result?.error) setError(result.error);
    });
  };

  if (step === "code") {
    return (
      <form onSubmit={submitCode} className="space-y-5" noValidate>
        <div>
          <p className="text-sm font-medium">{t.auth.twoFactorTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.auth.twoFactorSubtitle}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">{t.auth.twoFactorCode}</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoFocus
            required
            disabled={isPending}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t.auth.invalidCredentials}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setStep("credentials")}>
            {t.auth.backToPassword}
          </Button>
          <Button type="submit" className="flex-1" size="lg" disabled={isPending || !code}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t.auth.verifying}
              </>
            ) : (
              t.auth.verify
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submitCredentials} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error && (
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

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

// Re-exported so callers that only need the state shape don't need to import from ./actions directly.
export type { AdminLoginState };
