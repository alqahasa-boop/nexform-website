import { formatDistanceToNow } from "date-fns";

export interface ActivityTimelineEntry {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date | string;
  actorName?: string | null;
  note?: string | null;
}

export function ActivityTimeline({ entries }: { entries: ActivityTimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-4 border-s border-border ps-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -start-[1.32rem] top-1 size-2 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-sm">
            <span className="font-medium text-foreground">{entry.actorName ?? "System"}</span>{" "}
            <span className="text-muted-foreground">
              {entry.action.toLowerCase().replace(/_/g, " ")} this {entry.entityType.toLowerCase()}
            </span>
          </p>
          {entry.note && <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>}
          <time className="text-xs text-muted-foreground/70" dateTime={new Date(entry.createdAt).toISOString()}>
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </time>
        </li>
      ))}
    </ol>
  );
}
