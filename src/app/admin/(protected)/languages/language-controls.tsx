"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleLanguageActiveAction, setDefaultLanguageAction } from "@/features/languages/languages.actions";

export function LanguageControls({ code, isActive, isDefault }: { code: string; isActive: boolean; isDefault: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      {isDefault ? (
        <Badge>Default</Badge>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await setDefaultLanguageAction(code);
              if (result.success) router.refresh();
              else toast.error(result.error);
            })
          }
        >
          Make Default
        </Button>
      )}
      <div className="flex items-center gap-2">
        {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        <Switch
          checked={isActive}
          disabled={isPending}
          onCheckedChange={(checked) =>
            startTransition(async () => {
              const result = await toggleLanguageActiveAction(code, checked === true);
              if (result.success) router.refresh();
              else toast.error(result.error);
            })
          }
        />
      </div>
    </div>
  );
}
