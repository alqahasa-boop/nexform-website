import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/about-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "NEXFORM is a Kuwaiti architectural design studio built on vision, craftsmanship, and a bespoke approach to every project.",
};

export default function AboutPage() {
  return <AboutContent />;
}
