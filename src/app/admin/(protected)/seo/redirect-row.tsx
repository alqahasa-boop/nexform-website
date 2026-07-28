"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteRedirectAction } from "@/features/redirects/redirects.actions";

export function RedirectRow({ id, fromPath, toPath, statusCode }: { id: string; fromPath: string; toPath: string; statusCode: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-b border-border py-2.5 text-sm last:border-0" dir="ltr">
      <span className="font-mono">{fromPath}</span>
      <span className="text-muted-foreground">→</span>
      <span className="font-mono">{toPath}</span>
      <Badge variant="secondary">{statusCode}</Badge>
      <Button
        size="icon-sm"
        variant="ghost"
        className="ms-auto"
        disabled={isPending}
        aria-label="Delete redirect"
        onClick={() =>
          startTransition(async () => {
            const result = await deleteRedirectAction(id);
            if (result.success) router.refresh();
            else toast.error(result.error);
          })
        }
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
      </Button>
    </div>
  );
}
