"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { publishJourneyStageAction } from "@/features/construction-journey/construction-journey.actions";

export function StagePublishToggle({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      disabled={isPending}
      aria-label={isPublished ? "Unpublish" : "Publish"}
      onClick={() =>
        startTransition(async () => {
          const result = await publishJourneyStageAction(id, !isPublished);
          if (result.success) router.refresh();
          else toast.error(result.error);
        })
      }
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </Button>
  );
}
