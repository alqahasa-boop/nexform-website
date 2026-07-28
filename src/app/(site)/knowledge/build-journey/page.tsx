import type { Metadata } from "next";
import { BuildJourneyContent } from "@/components/pages/build-journey-content";
import { listJourneyStages } from "@/features/construction-journey/construction-journey.repository";

export const metadata: Metadata = {
  title: "Build Journey",
  description: "Eight stages from buying land to final delivery — the NEXFORM build journey.",
};

export const revalidate = 60;

export default async function BuildJourneyPage() {
  const [en, ar] = await Promise.all([
    listJourneyStages("en", true),
    listJourneyStages("ar", true),
  ]);

  const toStep = (s: (typeof en)[number]) => ({ title: s.title, description: s.richContent ?? "" });

  return <BuildJourneyContent steps={{ en: en.map(toStep), ar: ar.map(toStep) }} />;
}
