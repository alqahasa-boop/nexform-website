"use client";

import { useEffect } from "react";
import Image from "next/image";
import { recordAdImpressionAction, recordAdClickAction } from "@/features/advertisements/advertisements.actions";
import { cn } from "@/lib/utils";

export function AdSlotClient({
  creativeId,
  imageUrl,
  targetUrl,
  callToAction,
  title,
  companyName,
  className,
}: {
  creativeId: string;
  imageUrl: string | null;
  targetUrl: string | null;
  callToAction: string | null;
  title: string;
  companyName: string;
  className?: string;
}) {
  useEffect(() => {
    recordAdImpressionAction(creativeId);
  }, [creativeId]);

  const body = (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      <span className="absolute top-2 start-2 z-10 rounded bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
        Sponsored
      </span>
      {imageUrl ? (
        <Image src={imageUrl} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="100vw" />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted/40 p-6 text-center">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{companyName}</p>
          </div>
        </div>
      )}
      {callToAction && (
        <span className="absolute bottom-2 end-2 z-10 rounded-full bg-gold px-3 py-1 text-xs font-medium text-ink">{callToAction}</span>
      )}
    </div>
  );

  if (!targetUrl) return body;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => recordAdClickAction(creativeId)}
      aria-label={`${title} — ${companyName}`}
    >
      {body}
    </a>
  );
}
