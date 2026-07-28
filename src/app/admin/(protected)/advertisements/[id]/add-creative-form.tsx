"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { MediaPicker } from "@/components/admin/media-picker";
import { createCreativeAction } from "@/features/advertisements/advertisements.actions";

export function AddCreativeForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [image, setImage] = useState<{ id: string; url: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createCreativeAction({ campaignId, title, targetUrl: targetUrl || undefined, imageId: image?.id });
      if (result.success) {
        toast.success("Creative added.");
        setTitle("");
        setTargetUrl("");
        setImage(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-border p-4">
      <FormField label="Creative Title" required htmlFor="creative-title">
        <Input id="creative-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>
      <FormField label="Target URL" htmlFor="creative-url">
        <Input id="creative-url" type="url" dir="ltr" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
      </FormField>
      <FormField label="Banner Image">
        <MediaPicker value={image} onChange={setImage} />
      </FormField>
      <Button size="sm" onClick={handleSubmit} disabled={isPending || !title}>
        {isPending && <Loader2 className="animate-spin" />}
        Add Creative
      </Button>
    </div>
  );
}
