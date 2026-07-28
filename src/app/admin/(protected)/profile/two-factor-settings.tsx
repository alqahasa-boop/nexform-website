"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  startTwoFactorSetupAction,
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
} from "@/features/two-factor/two-factor.actions";

type SetupStage = "idle" | "scanning" | "backupCodes";

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [stage, setStage] = useState<SetupStage>("idle");
  const [secret, setSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStartSetup = () => {
    startTransition(async () => {
      const result = await startTwoFactorSetupAction();
      if (result.success) {
        setSecret(result.data.secret);
        setOtpauthUri(result.data.otpauthUri);
        setStage("scanning");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmTwoFactorSetupAction(code);
      if (result.success) {
        setBackupCodes(result.data.backupCodes);
        setStage("backupCodes");
        setEnabled(true);
        toast.success("Two-factor authentication enabled.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDisable = () => {
    startTransition(async () => {
      const result = await disableTwoFactorAction(disablePassword);
      if (result.success) {
        setEnabled(false);
        setShowDisableForm(false);
        setDisablePassword("");
        toast.success("Two-factor authentication disabled.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleFinishSetup = () => {
    setStage("idle");
    setCode("");
    setSecret("");
    setOtpauthUri("");
    setBackupCodes([]);
    router.refresh();
  };

  return (
    <section className="max-w-lg rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Two-Factor Authentication</h2>
        <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Enabled" : "Disabled"}</Badge>
      </div>

      {stage === "idle" && !enabled && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Add an extra verification step at sign-in using an authenticator app (Google Authenticator, Authy, 1Password, ...).
          </p>
          <Button onClick={handleStartSetup} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            <ShieldCheck className="size-4" />
            Enable 2FA
          </Button>
        </div>
      )}

      {stage === "scanning" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Add this account to your authenticator app, then enter the 6-digit code it shows to confirm.
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">Secret key (manual entry)</p>
            <p className="mt-1 break-all font-mono text-sm">{secret}</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">Provisioning URI</p>
            <p className="mt-1 break-all font-mono text-xs">{otpauthUri}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totp-confirm">6-digit code</Label>
            <Input id="totp-confirm" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={isPending} onClick={() => setStage("idle")}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending || code.length !== 6}>
              {isPending && <Loader2 className="animate-spin" />}
              Confirm
            </Button>
          </div>
        </div>
      )}

      {stage === "backupCodes" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Save your backup codes</p>
          <p className="text-sm text-muted-foreground">
            Each code can be used once to sign in if you lose access to your authenticator app. They will not be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Button onClick={handleFinishSetup}>Done</Button>
        </div>
      )}

      {enabled && stage === "idle" && (
        <div>
          {!showDisableForm ? (
            <Button variant="destructive" onClick={() => setShowDisableForm(true)}>
              <ShieldOff className="size-4" />
              Disable 2FA
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="disable-password">Confirm your password to disable 2FA</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isPending} onClick={() => setShowDisableForm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDisable} disabled={isPending || !disablePassword}>
                  {isPending && <Loader2 className="animate-spin" />}
                  Disable
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
