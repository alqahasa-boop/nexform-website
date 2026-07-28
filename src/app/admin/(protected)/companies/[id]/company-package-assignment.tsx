"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormField } from "@/components/admin/form-field";
import { toast } from "sonner";
import { updateCompanyAction } from "@/features/companies/companies.actions";

export interface ListingPackageOption {
  id: string;
  name: string;
}

export function CompanyPackageAssignment({
  companyId,
  packages,
  initialPackageId,
  initialExpiresAt,
}: {
  companyId: string;
  packages: ListingPackageOption[];
  initialPackageId: string | null;
  initialExpiresAt: string | null; // ISO date, already formatted for <input type="date">
}) {
  const [packageId, setPackageId] = useState(initialPackageId ?? "none");
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCompanyAction(companyId, {
        listingPackageId: packageId === "none" ? null : packageId,
        packageExpiresAt: expiresAt ? new Date(expiresAt) : null,
      });
      if (result.success) {
        toast.success("Listing package updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Listing Package">
        <Select value={packageId} onValueChange={(v) => v && setPackageId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
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
      <FormField label="Expires On" htmlFor="package-expires">
        <Input id="package-expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </FormField>
      <div className="sm:col-span-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Save Package
        </Button>
      </div>
    </div>
  );
}
