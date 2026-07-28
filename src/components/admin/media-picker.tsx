"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2, Check, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadMediaAction, listMediaForPickerAction, type UploadedMediaAsset } from "@/features/media/media.actions";
import { cn } from "@/lib/utils";

/** Selects (or uploads) a single MediaAsset — used for cover images, logos, creatives, etc. */
export function MediaPicker({
  value,
  onChange,
}: {
  value: { id: string; url: string } | null;
  onChange: (asset: { id: string; url: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UploadedMediaAsset[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadItems = () => {
    startTransition(async () => {
      const result = await listMediaForPickerAction({ kind: "IMAGE" });
      if (result.success) setItems(result.data.items);
      else toast.error(result.error);
    });
  };

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (result.success) {
        onChange({ id: result.data.id, url: result.data.url });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-fit">
          <Image src={value.url} alt="" width={160} height={120} className="h-28 w-40 rounded-lg border border-border object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute -end-2 -top-2 rounded-full"
            onClick={() => onChange(null)}
            aria-label="Remove image"
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="flex h-28 w-40 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
          <ImageOff className="size-6" />
        </div>
      )}

      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) loadItems(); }}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />} nativeButton={true}>
          Choose Image
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select an Image</DialogTitle>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload New
          </Button>

          <div className="grid max-h-96 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => { onChange({ id: item.id, url: item.url }); setOpen(false); }}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border border-border",
                  value?.id === item.id && "ring-2 ring-primary"
                )}
              >
                <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="120px" />
                {value?.id === item.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Check className="size-5 text-white" />
                  </span>
                )}
              </button>
            ))}
            {items.length === 0 && !isPending && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No images uploaded yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
