"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, LogOut, Ban, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  updateUserRolesAction,
  suspendUserAction,
  reactivateUserAction,
  initiatePasswordResetAction,
  revokeUserSessionsAction,
  deleteUserAction,
} from "@/features/users/users.actions";

interface RoleOption {
  id: string;
  name: string;
}

export function RoleEditor({ userId, roles, initialRoleIds }: { userId: string; roles: RoleOption[]; initialRoleIds: string[] }) {
  const [selected, setSelected] = useState(new Set(initialRoleIds));
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserRolesAction(userId, Array.from(selected));
      if (result.success) {
        toast.success("Roles updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <label key={role.id} className="flex items-center gap-2 text-sm">
          <Checkbox checked={selected.has(role.id)} onCheckedChange={() => toggle(role.id)} />
          {role.name}
        </label>
      ))}
      <Button size="sm" onClick={handleSave} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Save Roles
      </Button>
    </div>
  );
}

export function AccountActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ success: boolean; error?: string }>, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => initiatePasswordResetAction(userId), "Password reset email sent.")}>
        <KeyRound className="size-4" />
        Send Password Reset
      </Button>
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => revokeUserSessionsAction(userId), "All sessions revoked.")}>
        <LogOut className="size-4" />
        Revoke Sessions
      </Button>
      {isActive ? (
        <ConfirmationDialog
          title="Suspend this user?"
          description="They will be signed out immediately and unable to log in until reactivated."
          confirmLabel="Suspend"
          destructive
          onConfirm={() => suspendUserAction(userId)}
          onSuccess={() => router.refresh()}
          trigger={
            <Button variant="outline" size="sm">
              <Ban className="size-4" />
              Suspend
            </Button>
          }
        />
      ) : (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => reactivateUserAction(userId), "User reactivated.")}>
          <RotateCcw className="size-4" />
          Reactivate
        </Button>
      )}
      <ConfirmationDialog
        title="Delete this user?"
        description="This account will be deactivated and archived. This cannot be undone from the UI."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteUserAction(userId)}
        onSuccess={() => router.push("/admin/users")}
        trigger={
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        }
      />
    </div>
  );
}
