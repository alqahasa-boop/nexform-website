"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import { signupAction } from "@/features/customers/customers.actions";

export function CustomerSignupForm() {
  const { t } = useLanguage();
  const a = t.account;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const errorMessage = (code?: string) => {
    switch (code) {
      case "weak_password":
        return a.weakPassword;
      case "email_taken":
        return a.emailTaken;
      case "too_many_attempts":
        return a.tooManyAttempts;
      case "invalid_input":
        return a.invalidInput;
      default:
        return a.invalidInput;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("password", password);
    startTransition(async () => {
      const result = await signupAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{a.signUpTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{a.signUpSubtitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{a.name}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{a.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
          autoComplete="new-password"
          required
          minLength={8}
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
            {a.signingUp}
          </>
        ) : (
          a.signUp
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {a.haveAccount}{" "}
        <Link href="/customer/login" className="font-medium text-gold hover:underline">
          {a.signInInstead}
        </Link>
      </p>
    </form>
  );
}
