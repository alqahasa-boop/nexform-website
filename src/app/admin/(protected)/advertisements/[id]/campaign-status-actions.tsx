"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  submitCampaignForApprovalAction,
  approveCampaignAction,
  rejectCampaignAction,
  setCampaignStatusAction,
} from "@/features/advertisements/advertisements.actions";
import type { CampaignStatus } from "@/generated/prisma/client";

export function CampaignStatusActions({ id, status }: { id: string; status: CampaignStatus }) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success("Updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <Button size="sm" disabled={isPending} onClick={() => run(() => submitCampaignForApprovalAction(id))}>
            Submit for Approval
          </Button>
        )}
        {status === "PENDING_APPROVAL" && (
          <>
            <Button size="sm" disabled={isPending} onClick={() => run(() => approveCampaignAction(id))}>
              {isPending && <Loader2 className="animate-spin" />}
              Approve
            </Button>
            <Button size="sm" variant="outline" disabled={isPending} onClick={() => setShowReject((s) => !s)}>
              Reject
            </Button>
          </>
        )}
        {status === "APPROVED" && (
          <Button size="sm" disabled={isPending} onClick={() => run(() => setCampaignStatusAction(id, "ACTIVE"))}>
            Activate
          </Button>
        )}
        {status === "ACTIVE" && (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setCampaignStatusAction(id, "PAUSED"))}>
            Pause
          </Button>
        )}
        {status === "PAUSED" && (
          <Button size="sm" disabled={isPending} onClick={() => run(() => setCampaignStatusAction(id, "ACTIVE"))}>
            Resume
          </Button>
        )}
        {!["CANCELLED", "EXPIRED"].includes(status) && (
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run(() => setCampaignStatusAction(id, "CANCELLED"))}>
            Cancel Campaign
          </Button>
        )}
      </div>
      {showReject && (
        <div className="space-y-2">
          <Textarea placeholder="Reason for rejection…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} />
          <Button size="sm" variant="destructive" disabled={isPending || !rejectReason.trim()} onClick={() => run(() => rejectCampaignAction(id, rejectReason))}>
            Confirm Rejection
          </Button>
        </div>
      )}
    </div>
  );
}
