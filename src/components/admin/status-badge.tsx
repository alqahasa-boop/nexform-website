import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const POSITIVE = new Set([
  "PUBLISHED", "ACTIVE", "APPROVED", "VERIFIED", "COMPLETED", "RESOLVED", "DELIVERED", "FINAL_READY", "ACCEPTED",
]);
const NEGATIVE = new Set([
  "REJECTED", "CANCELLED", "EXPIRED", "ARCHIVED", "SUSPENDED", "FAILED", "UNVERIFIED",
]);
const NEUTRAL = new Set([
  "DRAFT", "PENDING", "PENDING_REVIEW", "PENDING_APPROVAL", "UNDER_REVIEW", "SCHEDULED", "NEW", "PAUSED",
  "WAITING_FOR_CUSTOMER_INFO", "IN_PROGRESS", "DRAFT_READY", "REVISION_REQUESTED",
]);

function toneForStatus(status: string): BadgeVariant {
  if (POSITIVE.has(status)) return "default";
  if (NEGATIVE.has(status)) return "destructive";
  if (NEUTRAL.has(status)) return "secondary";
  return "outline";
}

function humanizeStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge variant={toneForStatus(status)}>{label ?? humanizeStatus(status)}</Badge>;
}
