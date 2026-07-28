"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { createRedirectAction } from "@/features/redirects/redirects.actions";

export function RedirectForm() {
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState("301");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createRedirectAction({ fromPath, toPath, statusCode: Number(statusCode) });
      if (result.success) {
        toast.success("Redirect created.");
        setFromPath("");
        setToPath("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <FormField label="From Path" htmlFor="redirect-from">
        <Input id="redirect-from" dir="ltr" placeholder="/old-page" value={fromPath} onChange={(e) => setFromPath(e.target.value)} />
      </FormField>
      <FormField label="To Path" htmlFor="redirect-to">
        <Input id="redirect-to" dir="ltr" placeholder="/new-page" value={toPath} onChange={(e) => setToPath(e.target.value)} />
      </FormField>
      <FormField label="Status">
        <Select value={statusCode} onValueChange={(v) => v && setStatusCode(v)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["301", "302", "307", "308"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <Button onClick={handleSubmit} disabled={isPending || !fromPath || !toPath}>
        {isPending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
        Add
      </Button>
    </div>
  );
}
