"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateRolePermissionsAction } from "@/features/users/roles.actions";
import type { PermissionKey, PermissionModule } from "@/config/permissions.config";

export function RolePermissionMatrix({
  roleId,
  roleName,
  isSystem,
  permissionsByModule,
  grantedKeys,
}: {
  roleId: string;
  roleName: string;
  isSystem: boolean;
  permissionsByModule: Record<PermissionModule, { key: PermissionKey; action: string }[]>;
  grantedKeys: PermissionKey[];
}) {
  const [selected, setSelected] = useState(new Set(grantedKeys));
  const [isPending, startTransition] = useTransition();
  const isSuperAdmin = roleName === "Super Admin";

  const toggle = (key: PermissionKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateRolePermissionsAction(roleId, Array.from(selected));
      if (result.success) toast.success("Permissions updated.");
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
          Super Admin always has every permission regardless of this table — changes here have no effect.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(permissionsByModule).map(([mod, perms]) => (
              <tr key={mod} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-medium capitalize">{mod.replace(/([A-Z])/g, " $1")}</td>
                <td className="flex flex-wrap gap-4 px-4 py-3">
                  {perms.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-1.5 text-muted-foreground">
                      <Checkbox
                        checked={selected.has(perm.key)}
                        onCheckedChange={() => toggle(perm.key)}
                        disabled={isSuperAdmin}
                      />
                      {perm.action}
                    </label>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={handleSave} disabled={isPending || isSuperAdmin}>
        {isPending && <Loader2 className="animate-spin" />}
        Save Permissions
      </Button>
      {isSystem && <p className="text-xs text-muted-foreground">This is a protected system role — its key cannot be changed or deleted.</p>}
    </div>
  );
}
