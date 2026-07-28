import { EmptyState, ErrorState } from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  error,
  emptyTitle = "No results",
  emptyDescription,
  selectedIds,
  onToggleRow,
  onToggleAll,
  rowActions,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
  rowActions?: (row: T) => React.ReactNode;
}) {
  if (error) return <ErrorState description={error} />;
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const selectable = Boolean(onToggleRow);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds && rows.length > 0 && rows.every((r) => selectedIds.has(r.id))}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {rowActions && <TableHead className="w-10 text-end">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-state={selectedIds?.has(row.id) ? "selected" : undefined}>
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds?.has(row.id)}
                    onCheckedChange={() => onToggleRow?.(row.id)}
                    aria-label="Select row"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.key} className={cn("align-middle", col.className)}>
                  {col.render(row)}
                </TableCell>
              ))}
              {rowActions && <TableCell className="text-end">{rowActions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DataTableSkeleton({ columnCount = 4, rowCount = 8 }: { columnCount?: number; rowCount?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="divide-y divide-border">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-3">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
