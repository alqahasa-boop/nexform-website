"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { assignDesignRequestAction, updateDesignRequestPriorityAction } from "@/features/design-requests/design-requests.actions";

interface StaffOption {
  id: string;
  name: string | null;
  email: string;
}

export function AssignControl({ id, assignedToId, staff }: { id: string; assignedToId: string | null; staff: StaffOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string | null) => {
    startTransition(async () => {
      const result = await assignDesignRequestAction(id, value === "unassigned" ? null : value);
      if (result.success) {
        toast.success("Assignee updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Select value={assignedToId ?? "unassigned"} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {staff.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name ?? s.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PriorityControl({ id, priority }: { id: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string | null) => {
    if (!value) return;
    startTransition(async () => {
      const result = await updateDesignRequestPriorityAction(id, value as never);
      if (result.success) {
        toast.success("Priority updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Select value={priority} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
