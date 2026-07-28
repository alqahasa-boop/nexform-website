"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "./empty-state";
import { toast } from "sonner";
import type { ApiResult } from "@/types/api";

export interface BulkRow {
  id: string;
  content: React.ReactNode;
}

export interface BulkAction {
  label: string;
  destructive?: boolean;
  /** Must be an actual `"use server"` action — plain closures can't cross the Server→Client boundary. */
  onRun: (ids: string[]) => Promise<ApiResult<unknown>>;
  confirm?: string;
}

export function BulkActionsTable({
  rows,
  actions,
  emptyTitle = "No results",
}: {
  rows: BulkRow[];
  actions: BulkAction[];
  emptyTitle?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (rows.length === 0) return <EmptyState title={emptyTitle} />;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));

  const runAction = (action: BulkAction) => {
    if (action.confirm && !window.confirm(action.confirm)) return;
    startTransition(async () => {
      const result = await action.onRun(Array.from(selected));
      if (result.success) {
        toast.success(`${action.label} applied to ${selected.size} item(s).`);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <span className="px-1 text-sm text-muted-foreground">{selected.size} selected</span>
          {actions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.destructive ? "destructive" : "outline"}
              disabled={isPending}
              onClick={() => runAction(action)}
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        <div className="flex items-center gap-3 bg-muted/40 p-3">
          <Checkbox checked={selected.size === rows.length} onCheckedChange={toggleAll} aria-label="Select all rows" />
          <span className="text-xs font-medium text-muted-foreground">Select all</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 bg-card p-3">
            <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)} aria-label="Select row" />
            <div className="min-w-0 flex-1">{row.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
