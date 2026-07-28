"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RevisionHistoryDialog } from "@/components/admin/revision-history-dialog";
import { deleteContentAction } from "@/features/content/content.actions";

export function ContentRowActions({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-1">
      <Button size="icon-sm" variant="ghost" render={<Link href={`/admin/content/${id}`} />} nativeButton={false} aria-label="Edit">
        <Pencil className="size-4" />
      </Button>
      <RevisionHistoryDialog entityType="Content" entityId={id} />
      <ConfirmationDialog
        title="Delete this content item?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteContentAction(id)}
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
