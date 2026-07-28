"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { updateOwnProfileAction } from "./actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-sm space-y-4">
      <FormField label="Name" htmlFor="profile-name">
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <Button
        onClick={() =>
          startTransition(async () => {
            const result = await updateOwnProfileAction(name);
            if (result.success) {
              toast.success("Profile updated.");
              router.refresh();
            } else {
              toast.error(result.error);
            }
          })
        }
        disabled={isPending}
      >
        {isPending && <Loader2 className="animate-spin" />}
        Save
      </Button>
    </div>
  );
}
