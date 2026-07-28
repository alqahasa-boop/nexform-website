"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, File as FileIcon, Video, Trash2, Download } from "lucide-react";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { deleteMediaAssetAction } from "@/features/media/media.actions";

export interface MediaGridItemData {
  id: string;
  url: string;
  fileName: string;
  kind: "IMAGE" | "PDF" | "DOCUMENT" | "VIDEO";
  sizeBytes: number;
  uploadedBy: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const KIND_ICONS = { PDF: FileText, DOCUMENT: FileIcon, VIDEO: Video } as const;

export function MediaGridItem({ item, canDelete }: { item: MediaGridItemData; canDelete: boolean }) {
  const router = useRouter();
  const Icon = item.kind !== "IMAGE" ? KIND_ICONS[item.kind] : null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex aspect-square items-center justify-center bg-muted">
        {item.kind === "IMAGE" ? (
          <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="200px" />
        ) : (
          Icon && <Icon className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium">{item.fileName}</p>
        <p className="text-[0.7rem] text-muted-foreground">{formatBytes(item.sizeBytes)}</p>
      </div>
      <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon-xs" variant="secondary" render={<a href={item.url} download={item.fileName} />} nativeButton={false} aria-label="Download">
          <Download className="size-3" />
        </Button>
        {canDelete && (
          <ConfirmationDialog
            title="Delete this file?"
            description="This cannot be undone. Files currently in use elsewhere cannot be deleted."
            confirmLabel="Delete"
            destructive
            onConfirm={() => deleteMediaAssetAction(item.id)}
            onSuccess={() => router.refresh()}
            trigger={
              <Button size="icon-xs" variant="destructive" aria-label="Delete">
                <Trash2 className="size-3" />
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
