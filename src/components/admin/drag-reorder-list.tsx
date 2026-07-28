"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/types/api";
import type { BulkAction } from "./bulk-actions-table";

export interface DragReorderRow {
  id: string;
  content: React.ReactNode;
}

/**
 * Native HTML5 drag-and-drop reordering — persists the new order via `onReorder` on drop.
 * Takes pre-rendered `content` per row (not a render function) because a Server Component
 * caller cannot pass a plain function into this Client Component — only serializable
 * values (including already-rendered React elements, and actual `"use server"` actions)
 * can cross that boundary.
 *
 * Optionally supports bulk selection (`bulkActions`) alongside drag reordering.
 */
export function DragReorderList({
  rows,
  onReorder,
  emptyTitle = "No items yet",
  bulkActions,
}: {
  rows: DragReorderRow[];
  onReorder: (orderedIds: string[]) => Promise<ApiResult<null>>;
  emptyTitle?: string;
  bulkActions?: BulkAction[];
}) {
  const [order, setOrder] = useState(() => rows.map((row) => row.id));
  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const byId = new Map(rows.map((row) => [row.id, row]));

  if (rows.length === 0) return <EmptyState title={emptyTitle} />;

  const handleDrop = (targetId: string) => {
    const draggedId = dragId;
    setDragId(null);
    if (!draggedId || draggedId === targetId) return;

    const next = [...order];
    const from = next.indexOf(draggedId);
    const to = next.indexOf(targetId);
    if (from === -1 || to === -1) return;
    next.splice(from, 1);
    next.splice(to, 0, draggedId);
    setOrder(next);

    onReorder(next).then((result) => {
      if (!result.success) toast.error(result.error);
    });
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
      {bulkActions && selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <span className="px-1 text-sm text-muted-foreground">{selected.size} selected</span>
          {bulkActions.map((action) => (
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
        {order.map((id) => {
          const row = byId.get(id);
          if (!row) return null;
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDragId(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(id)}
              data-dragging={dragId === id || undefined}
              className="flex items-center gap-3 bg-card p-3 data-dragging:opacity-50"
            >
              {bulkActions && (
                <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} aria-label="Select row" />
              )}
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-label="Drag to reorder" />
              <div className="min-w-0 flex-1">{row.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
