"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import { customerLoginAction } from "@/features/customers/customers.actions";

export function CustomerLoginForm() {
  const { t } = useLanguage();
  const a = t.account;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const errorMessage = (code?: string) => {
    if (!code) return undefined;
    if (code === "invalid_credentials") return a.invalidCredentials;
    return a.invalidInput;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    startTransition(async () => {
      const result = await customerLoginAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{a.signInTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{a.signInSubtitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{a.email}</Label>
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
        <Label htmlFor="password">{a.password}</Label>
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
          {errorMessage(error)}
        </p>
      )}

      <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            {a.signingIn}
          </>
        ) : (
          a.signIn
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {a.noAccount}{" "}
        <Link href="/customer/signup" className="font-medium text-gold hover:underline">
          {a.createOne}
        </Link>
      </p>
    </form>
  );
}
