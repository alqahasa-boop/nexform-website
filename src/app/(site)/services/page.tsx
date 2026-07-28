import type { Metadata } from "next";
import { ServicesContent } from "@/components/pages/services-content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Architectural design, interior design, facade design, engineering consultation, 3D visualization, and construction guidance from NEXFORM.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
