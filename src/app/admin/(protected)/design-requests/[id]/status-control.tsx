"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { changeDesignRequestStatusAction } from "@/features/design-requests/design-requests.actions";
import type { DesignRequestStatus } from "@/generated/prisma/client";

const STATUSES: DesignRequestStatus[] = [
  "NEW", "UNDER_REVIEW", "WAITING_FOR_CUSTOMER_INFO", "ACCEPTED", "IN_PROGRESS",
  "DRAFT_READY", "REVISION_REQUESTED", "FINAL_READY", "DELIVERED", "COMPLETED", "CANCELLED",
];

export function StatusControl({ id, currentStatus }: { id: string; currentStatus: DesignRequestStatus }) {
  const [status, setStatus] = useState<DesignRequestStatus>(currentStatus);
  const [note, setNote] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await changeDesignRequestStatusAction(id, status, note || undefined);
      if (result.success) {
        toast.success("Status updated.");
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={(v) => v && setStatus(v as DesignRequestStatus)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea placeholder="Optional note about this change…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button size="sm" onClick={handleSubmit} disabled={isPending || status === currentStatus}>
        {isPending && <Loader2 className="animate-spin" />}
        Update Status
      </Button>
    </div>
  );
}
