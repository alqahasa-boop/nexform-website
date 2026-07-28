"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createJourneyStageAction, updateJourneyStageAction } from "@/features/construction-journey/construction-journey.actions";

export interface JourneyStageData {
  id: string;
  order: number;
  title: string;
  richContent: string | null;
  status: string;
}

export function StageDialog({ stage, nextOrder }: { stage?: JourneyStageData; nextOrder?: number }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(stage?.order ?? nextOrder ?? 0);
  const [title, setTitle] = useState(stage?.title ?? "");
  const [richContent, setRichContent] = useState(stage?.richContent ?? "");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = { order, title, richContent: richContent || undefined };
      const result = stage ? await updateJourneyStageAction(stage.id, payload) : await createJourneyStageAction(payload);
      if (result.success) {
        toast.success(stage ? "Stage updated." : "Stage created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={stage ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />} nativeButton={true}>
        {stage ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Stage
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stage ? "Edit Stage" : "New Stage"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <FormField label="Order" required htmlFor="stage-order" className="col-span-1">
              <Input id="stage-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </FormField>
            <FormField label="Title" required htmlFor="stage-title" className="col-span-3">
              <Input id="stage-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Content">
            <RichTextEditor value={richContent} onChange={setRichContent} rows={8} />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !title}>
            {isPending && <Loader2 className="animate-spin" />}
            {stage ? "Save Changes" : "Create Stage"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
