import { listActiveAdsForPlacement } from "@/features/advertisements/advertisements.repository";
import { AdSlotClient } from "./ad-slot-client";

/**
 * Renders the highest-priority active campaign creative booked into `placementKey`, or nothing
 * if no campaign is currently active there. `deviceTargeting` on the booking is honored via the
 * `hideOnMobile`/`hideOnDesktop` wrapper classes the caller applies — see call sites.
 */
export async function AdSlot({ placementKey, className }: { placementKey: string; className?: string }) {
  const ads = await listActiveAdsForPlacement(placementKey);
  const ad = ads[0];
  if (!ad) return null;

  return (
    <AdSlotClient
      creativeId={ad.creative.id}
      imageUrl={ad.creative.image?.url ?? null}
      targetUrl={ad.creative.targetUrl}
      callToAction={ad.creative.callToAction}
      title={ad.creative.title}
      companyName={ad.campaign.company.name}
      className={className}
    />
  );
}
