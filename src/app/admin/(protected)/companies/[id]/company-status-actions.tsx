"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Check, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approveCompanyAction, rejectCompanyAction, verifyCompanyAction } from "@/features/companies/companies.actions";

export function CompanyStatusActions({ id }: { id: string }) {
  const router = useRouter();
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
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={isPending} onClick={() => run(() => approveCompanyAction(id))}>
        {isPending ? <Loader2 className="animate-spin" /> : <Check className="size-4" />}
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => rejectCompanyAction(id))}>
        <X className="size-4" />
        Reject
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => verifyCompanyAction(id))}>
        <ShieldCheck className="size-4" />
        Mark Verified
      </Button>
    </div>
  );
}
