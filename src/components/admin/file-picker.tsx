"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2, FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadMediaAction, listMediaForPickerAction, type UploadedMediaAsset } from "@/features/media/media.actions";
import { cn } from "@/lib/utils";

/** Selects (or uploads) a single non-image file — PDFs, DOCX, DWG, etc. */
export function FilePicker({
  value,
  onChange,
}: {
  value: { id: string; fileName: string } | null;
  onChange: (asset: { id: string; fileName: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UploadedMediaAsset[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadItems = () => {
    startTransition(async () => {
      const [pdfs, docs] = await Promise.all([
        listMediaForPickerAction({ kind: "PDF" }),
        listMediaForPickerAction({ kind: "DOCUMENT" }),
      ]);
      const combined = [...(pdfs.success ? pdfs.data.items : []), ...(docs.success ? docs.data.items : [])];
      setItems(combined);
    });
  };

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (result.success) {
        onChange({ id: result.data.id, fileName: result.data.fileName });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <FileText className="size-4 text-muted-foreground" />
          {value.fileName}
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => onChange(null)} aria-label="Remove file">
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No file selected.</p>
      )}

      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) loadItems(); }}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />} nativeButton={true}>
          Choose File
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select a File</DialogTitle>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.doc,.docx,.xls,.xlsx,.dwg"
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

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => { onChange({ id: item.id, fileName: item.fileName }); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-start text-sm hover:bg-muted",
                  value?.id === item.id && "ring-2 ring-primary"
                )}
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.fileName}</span>
                {value?.id === item.id && <Check className="ms-auto size-4 shrink-0 text-primary" />}
              </button>
            ))}
            {items.length === 0 && !isPending && <p className="py-6 text-center text-sm text-muted-foreground">No files uploaded yet.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
