"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { deleteFaqItemAction } from "@/features/faq/faq.actions";
import { FaqItemDialog, type FaqItemData } from "./faq-item-dialog";

export function FaqRowActions({ item }: { item: FaqItemData }) {
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center gap-1">
      <FaqItemDialog item={item} />
      <ConfirmationDialog
        title="Delete this FAQ item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteFaqItemAction(item.id)}
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
