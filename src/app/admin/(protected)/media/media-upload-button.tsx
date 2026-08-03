"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadMediaAction } from "@/features/media/media.actions";

export function MediaUploadButton({ folderId }: { folderId?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFiles = (files: FileList) => {
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        if (folderId) formData.append("folderId", folderId);
        const result = await uploadMediaAction(formData);
        if (!result.success) toast.error(`${file.name}: ${result.error}`);
      }
      router.refresh();
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
        Upload Files
      </Button>
    </>
  );
}
