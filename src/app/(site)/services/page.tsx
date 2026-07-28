import type { Metadata } from "next";
import { ServicesContent } from "@/components/pages/services-content";
import { listPublishedServices } from "@/features/services/services.repository";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Architectural design, interior design, facade design, engineering consultation, 3D visualization, and construction guidance from NEXFORM.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  const [en, ar] = await Promise.all([listPublishedServices("en"), listPublishedServices("ar")]);

  const toCard = (s: (typeof en)[number]) => ({
    slug: s.slug,
    title: s.title,
    description: s.description ?? "",
    coverImageUrl: s.coverImage?.url ?? null,
    icon: s.icon,
    features: s.features,
    ctaLabel: s.ctaLabel,
    ctaUrl: s.ctaUrl,
  });

  return <ServicesContent services={{ en: en.map(toCard), ar: ar.map(toCard) }} />;
}
