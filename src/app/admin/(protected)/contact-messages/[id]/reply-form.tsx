"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import {
  replyToContactMessageAction,
  markContactMessageStatusAction,
  assignContactMessageAction,
} from "@/features/contact-messages/contact-messages.actions";
import type { MessageStatus } from "@/generated/prisma/client";

interface StaffOption {
  id: string;
  name: string | null;
  email: string;
}

export function ReplyForm({ contactMessageId }: { contactMessageId: string }) {
  const [body, setBody] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      const result = await replyToContactMessageAction({ contactMessageId, body });
      if (result.success) {
        setBody("");
        toast.success("Reply sent.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Textarea placeholder="Write a reply…" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      <Button size="sm" onClick={handleSubmit} disabled={isPending || !body.trim()}>
        {isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
        Send Reply
      </Button>
    </div>
  );
}

export function StatusControl({ id, status }: { id: string; status: MessageStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string | null) => {
    if (!value) return;
    startTransition(async () => {
      const result = await markContactMessageStatusAction(id, value as never);
      if (result.success) router.refresh();
      else toast.error(result.error);
    });
  };

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AssignControl({ id, assignedToId, staff }: { id: string; assignedToId: string | null; staff: StaffOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string | null) => {
    startTransition(async () => {
      const result = await assignContactMessageAction(id, value === "unassigned" ? null : value);
      if (result.success) router.refresh();
      else toast.error(result.error);
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
