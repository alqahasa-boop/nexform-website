"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { inviteUserAction } from "@/features/users/users.actions";

interface RoleOption {
  id: string;
  name: string;
}

export function InviteUserForm({ roles }: { roles: RoleOption[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleRole = (id: string) => {
    setRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await inviteUserAction({ name: name || undefined, email, roleIds: Array.from(roleIds) });
      if (result.success) {
        toast.success("Invitation sent. The user will receive an email to set their password.");
        router.push(`/admin/users/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-lg space-y-5">
      <FormField label="Name" htmlFor="invite-name">
        <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Email" required htmlFor="invite-email">
        <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Roles">
        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={roleIds.has(role.id)} onCheckedChange={() => toggleRole(role.id)} />
              {role.name}
            </label>
          ))}
        </div>
      </FormField>
      <Button onClick={handleSubmit} disabled={isPending || !email}>
        {isPending && <Loader2 className="animate-spin" />}
        Send Invitation
      </Button>
    </div>
  );
}
