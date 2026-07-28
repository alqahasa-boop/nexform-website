"use client";

import { useTransition } from "react";
import { Loader2, Send, Archive, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ApiResult } from "@/types/api";
import { StatusBadge } from "./status-badge";

/** Generic Draft/Publish/Archive control strip — pass the specific server actions for this entity. */
export function PublishControls({
  status,
  onSaveDraft,
  onPublish,
  onArchive,
  onSuccess,
  disabled,
}: {
  status: string;
  onSaveDraft?: () => Promise<ApiResult<unknown>>;
  onPublish?: () => Promise<ApiResult<unknown>>;
  onArchive?: () => Promise<ApiResult<unknown>>;
  onSuccess?: () => void;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<ApiResult<unknown>>, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <StatusBadge status={status} />
      <div className="ms-auto flex gap-2">
        {onSaveDraft && status !== "DRAFT" && (
          <Button type="button" variant="outline" size="sm" disabled={disabled || isPending} onClick={() => run(onSaveDraft, "Saved as draft.")}>
            Save as Draft
          </Button>
        )}
        {onArchive && status !== "ARCHIVED" && (
          <Button type="button" variant="outline" size="sm" disabled={disabled || isPending} onClick={() => run(onArchive, "Archived.")}>
            <Archive className="size-4" />
            Archive
          </Button>
        )}
        {onPublish && status !== "PUBLISHED" && (
          <Button type="button" size="sm" disabled={disabled || isPending} onClick={() => run(onPublish, "Published.")}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
            Publish
          </Button>
        )}
        {status === "PUBLISHED" && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="size-4" />
            Live
          </span>
        )}
      </div>
    </div>
  );
}
