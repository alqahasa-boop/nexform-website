"use client";

import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/csv-download";
import type { ApiResult } from "@/types/api";

export function CsvExportButton({ action, label = "Export CSV" }: { action: () => Promise<ApiResult<{ csv: string; filename: string }>>; label?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          if (result.success) {
            downloadCsv(result.data.filename, result.data.csv);
          } else {
            toast.error(result.error);
          }
        })
      }
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  );
}
