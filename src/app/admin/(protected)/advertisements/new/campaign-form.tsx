"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { createCampaignAction } from "@/features/advertisements/advertisements.actions";

interface Option {
  id: string;
  name: string;
}

export function CampaignForm({ companies, packages }: { companies: Option[]; packages: Option[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!companyId) {
      toast.error("Select a company.");
      return;
    }
    startTransition(async () => {
      const result = await createCampaignAction({
        name,
        companyId,
        packageId: packageId ?? undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (result.success) {
        toast.success("Campaign created.");
        router.push(`/admin/advertisements/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-lg space-y-5">
      <FormField label="Campaign Name" required htmlFor="campaign-name">
        <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Advertiser (Company)" required>
        <Select value={companyId ?? undefined} onValueChange={(v) => setCompanyId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Package">
        <Select value={packageId ?? "none"} onValueChange={(v) => setPackageId(v === "none" ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No package" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No package</SelectItem>
            {packages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date" htmlFor="campaign-start">
          <Input id="campaign-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="End Date" htmlFor="campaign-end">
          <Input id="campaign-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
      </div>
      <Button onClick={handleSubmit} disabled={isPending || !name || !companyId}>
        {isPending && <Loader2 className="animate-spin" />}
        Create Campaign
      </Button>
    </div>
  );
}
