"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History, Loader2, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { listRevisionsAction, restoreRevisionAction } from "@/features/revisions/revisions.actions";
import type { RevisionEntityType } from "@/features/revisions/revisions.repository";

interface RevisionRow {
  id: string;
  version: number;
  createdAt: Date;
  editorName: string | null;
}

export function RevisionHistoryDialog({ entityType, entityId }: { entityType: RevisionEntityType; entityId: string }) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<RevisionRow[] | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isRestoring, startRestoring] = useTransition();
  const router = useRouter();

  const loadRevisions = () => {
    startLoading(async () => {
      const result = await listRevisionsAction(entityType, entityId);
      if (result.success) {
        setRevisions(result.data);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRestore = (revisionId: string) => {
    startRestoring(async () => {
      const result = await restoreRevisionAction(revisionId);
      if (result.success) {
        toast.success("Restored to that revision.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && revisions === null) loadRevisions();
      }}
    >
      <DialogTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Revision history" />} nativeButton={true}>
        <History className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Revision History</DialogTitle>
        </DialogHeader>
        {isLoading && revisions === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : !revisions || revisions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No previous revisions yet — one is saved automatically every time this item is edited.
          </p>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {revisions.map((rev) => (
              <li key={rev.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Version {rev.version}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(rev.createdAt, { addSuffix: true })}
                    {rev.editorName && ` · ${rev.editorName}`}
                  </p>
                </div>
                <Button size="sm" variant="outline" disabled={isRestoring} onClick={() => handleRestore(rev.id)}>
                  {isRestoring ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
