import type { Metadata } from "next";
import { BuildJourneyContent } from "@/components/pages/build-journey-content";

export const metadata: Metadata = {
  title: "Build Journey",
  description: "Eight stages from buying land to final delivery — the NEXFORM build journey.",
};

export default function BuildJourneyPage() {
  return <BuildJourneyContent />;
}
