import { z } from "zod";

export const trackEventSchema = z.object({
  type: z.enum([
    "PAGE_VIEW",
    "SESSION_START",
    "CONTENT_VIEW",
    "DOWNLOAD",
    "SEARCH_QUERY",
    "COMPANY_PROFILE_VIEW",
    "AD_IMPRESSION",
    "AD_CLICK",
    "WHATSAPP_CLICK",
    "CONTACT_CLICK",
    "DESIGN_SAVE",
    "DESIGN_SHARE",
    "DESIGN_REQUEST_CONVERSION",
    "CONTACT_SUBMIT",
  ]),
  path: z.string().max(500).optional(),
  entityType: z.string().max(80).optional(),
  entityId: z.string().uuid().optional(),
  referrer: z.string().max(500).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(120).optional(),
  device: z.string().max(60).optional(),
  browser: z.string().max(60).optional(),
  sessionId: z.string().max(120).optional(),
  userId: z.string().uuid().optional(),
  searchQuery: z.string().max(300).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type TrackEventInput = z.infer<typeof trackEventSchema>;

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}
