"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RevisionHistoryDialog } from "@/components/admin/revision-history-dialog";
import { publishDesignIdeaAction, deleteDesignIdeaAction } from "@/features/design-ideas/design-ideas.actions";
import { IdeaDialog, type DesignIdeaData } from "./idea-dialog";

export function IdeaRowActions({ idea }: { idea: DesignIdeaData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Publish"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await publishDesignIdeaAction(idea.id);
            if (result.success) router.refresh();
            else toast.error(result.error);
          })
        }
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
      <IdeaDialog idea={idea} />
      <RevisionHistoryDialog entityType="DesignIdea" entityId={idea.id} />
      <ConfirmationDialog
        title="Delete this design idea?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteDesignIdeaAction(idea.id)}
        onSuccess={() => router.refresh()}
        trigger={
          <Button size="icon-sm" variant="ghost" aria-label="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
      />
    </div>
  );
}
