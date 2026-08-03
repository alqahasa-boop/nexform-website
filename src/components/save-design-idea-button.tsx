"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { toggleSaveDesignIdeaAction } from "@/features/design-ideas/design-ideas.actions";
import { cn } from "@/lib/utils";

export function SaveDesignIdeaButton({
  designIdeaId,
  initialSaved,
  className,
}: {
  designIdeaId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleSaveDesignIdeaAction(designIdeaId);
      if (!result.success) {
        if (result.code === "UNAUTHENTICATED") router.push("/customer/login");
        else toast.error(result.error);
        return;
      }
      setSaved(result.data.saved);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? t.account.unsave : t.account.save}
      aria-pressed={saved}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-60",
        className
      )}
    >
      <Heart className={cn("size-4 transition-transform", saved && "scale-110 fill-current text-gold")} />
    </button>
  );
}
