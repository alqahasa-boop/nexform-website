"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { assignCreativeToPlacementAction } from "@/features/advertisements/advertisements.actions";
import { DEVICE_TARGETS } from "@/features/advertisements/types";

export interface PlacementOption {
  id: string;
  name: string;
  key: string;
}

export function AssignPlacementForm({
  campaignId,
  creativeId,
  placements,
}: {
  campaignId: string;
  creativeId: string;
  placements: PlacementOption[];
}) {
  const [placementId, setPlacementId] = useState(placements[0]?.id ?? "");
  const [devices, setDevices] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleDevice = (device: string) =>
    setDevices((prev) => {
      const next = new Set(prev);
      if (next.has(device)) next.delete(device);
      else next.add(device);
      return next;
    });

  const handleAssign = () => {
    if (!placementId) return;
    startTransition(async () => {
      const result = await assignCreativeToPlacementAction({
        campaignId,
        creativeId,
        placementId,
        deviceTargeting: Array.from(devices),
      });
      if (result.success) {
        toast.success("Creative assigned to placement.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (placements.length === 0) return <p className="text-xs text-muted-foreground">No placements configured yet.</p>;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border p-2">
      <Select value={placementId} onValueChange={(v) => v && setPlacementId(v)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {placements.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-3">
        {DEVICE_TARGETS.map((device) => (
          <div key={device} className="flex items-center gap-1.5">
            <Checkbox id={`${creativeId}-${device}`} checked={devices.has(device)} onCheckedChange={() => toggleDevice(device)} />
            <Label htmlFor={`${creativeId}-${device}`} className="text-xs capitalize">
              {device}
            </Label>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={handleAssign} disabled={isPending}>
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Assign to Placement
      </Button>
    </div>
  );
}
