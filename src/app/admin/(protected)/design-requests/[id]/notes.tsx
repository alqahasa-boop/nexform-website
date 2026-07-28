"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { addInternalNoteAction } from "@/features/design-requests/design-requests.actions";

export interface MessageEntry {
  id: string;
  body: string;
  isInternal: boolean;
  authorName: string | null;
  createdAt: Date | string;
}

export function DesignRequestNotes({ designRequestId, messages }: { designRequestId: string; messages: MessageEntry[] }) {
  const [note, setNote] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!note.trim()) return;
    startTransition(async () => {
      const result = await addInternalNoteAction(designRequestId, note);
      if (result.success) {
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="max-h-72 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages or notes yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.isInternal ? "rounded-lg bg-muted/60 p-2.5" : "rounded-lg border border-border p-2.5"}>
              <p className="text-sm">{m.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.isInternal ? "Internal note" : "Customer message"} · {m.authorName ?? "—"} ·{" "}
                {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2">
        <Textarea placeholder="Add an internal note (not visible to the customer)…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !note.trim()}>
          {isPending && <Loader2 className="animate-spin" />}
          Add Note
        </Button>
      </div>
    </div>
  );
}
