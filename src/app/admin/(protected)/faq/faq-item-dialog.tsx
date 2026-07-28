"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { createFaqItemAction, updateFaqItemAction } from "@/features/faq/faq.actions";

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  language: string;
  isPublished: boolean;
}

export function FaqItemDialog({ item }: { item?: FaqItemData }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = { question, answer, category: category || undefined, isPublished };
      const result = item ? await updateFaqItemAction(item.id, payload) : await createFaqItemAction(payload);
      if (result.success) {
        toast.success(item ? "FAQ updated." : "FAQ created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={item ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />}
        nativeButton={true}
      >
        {item ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New FAQ
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit FAQ" : "New FAQ"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Question" required htmlFor="faq-question">
            <Input id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </FormField>
          <FormField label="Answer" required htmlFor="faq-answer">
            <Textarea id="faq-answer" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </FormField>
          <FormField label="Category" htmlFor="faq-category">
            <Input id="faq-category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </FormField>
          <div className="flex items-center gap-2">
            <Switch id="faq-published" checked={isPublished} onCheckedChange={(v) => setIsPublished(v === true)} />
            <Label htmlFor="faq-published">Published</Label>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !question || !answer}>
            {isPending && <Loader2 className="animate-spin" />}
            {item ? "Save Changes" : "Create FAQ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
