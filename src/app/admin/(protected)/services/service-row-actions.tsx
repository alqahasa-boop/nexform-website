"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RevisionHistoryDialog } from "@/components/admin/revision-history-dialog";
import { publishServiceAction, deleteServiceAction } from "@/features/services/services.actions";
import { ServiceDialog, type ServiceData } from "./service-dialog";

export function ServiceRowActions({ service }: { service: ServiceData }) {
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
            const result = await publishServiceAction(service.id);
            if (result.success) router.refresh();
            else toast.error(result.error);
          })
        }
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
      <ServiceDialog service={service} />
      <RevisionHistoryDialog entityType="Service" entityId={service.id} />
      <ConfirmationDialog
        title="Delete this service?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteServiceAction(service.id)}
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
