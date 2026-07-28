"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { updateGeneralSettingsAction } from "@/features/settings/settings.actions";

export interface GeneralSettingsData {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  maintenanceMode: boolean;
}

export function SettingsForm({ initial }: { initial: GeneralSettingsData }) {
  const [siteName, setSiteName] = useState(initial.siteName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [contactAddress, setContactAddress] = useState(initial.contactAddress);
  const [maintenanceMode, setMaintenanceMode] = useState(initial.maintenanceMode);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateGeneralSettingsAction({ siteName, contactEmail, contactPhone, contactAddress, maintenanceMode });
      if (result.success) {
        toast.success("Settings saved.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-lg space-y-5">
      <FormField label="Site Name" htmlFor="settings-name">
        <Input id="settings-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      </FormField>
      <FormField label="Contact Email" htmlFor="settings-email">
        <Input id="settings-email" type="email" dir="ltr" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </FormField>
      <FormField label="Contact Phone" htmlFor="settings-phone">
        <Input id="settings-phone" dir="ltr" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </FormField>
      <FormField label="Address" htmlFor="settings-address">
        <Textarea id="settings-address" rows={2} value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
      </FormField>
      <div className="flex items-center gap-2 rounded-lg border border-border p-3">
        <Switch id="settings-maintenance" checked={maintenanceMode} onCheckedChange={(v) => setMaintenanceMode(v === true)} />
        <div>
          <Label htmlFor="settings-maintenance">Maintenance Mode</Label>
          <p className="text-xs text-muted-foreground">When enabled, the public site shows a maintenance notice.</p>
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Save Settings
      </Button>
    </div>
  );
}
