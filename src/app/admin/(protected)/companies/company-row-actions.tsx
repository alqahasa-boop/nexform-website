"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { deleteCompanyAction } from "@/features/companies/companies.actions";

export function CompanyRowActions({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/companies/${id}`} className="text-sm font-medium text-primary hover:underline">
        Manage
      </Link>
      <ConfirmationDialog
        title="Delete this company?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteCompanyAction(id)}
        onSuccess={() => router.refresh()}
        trigger={
          <Button size="icon-sm" variant="ghost" aria-label="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
      />
    </div>
  );
}
