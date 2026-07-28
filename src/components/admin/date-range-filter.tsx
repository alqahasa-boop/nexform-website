"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "30";
  const isCustom = current === "custom";

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={current} onValueChange={(v) => v && setParam("range", v)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCustom && (
        <>
          <Input
            type="date"
            className="w-40"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(e) => setParam("from", e.target.value || null)}
            aria-label="From date"
          />
          <Input
            type="date"
            className="w-40"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(e) => setParam("to", e.target.value || null)}
            aria-label="To date"
          />
        </>
      )}
    </div>
  );
}
