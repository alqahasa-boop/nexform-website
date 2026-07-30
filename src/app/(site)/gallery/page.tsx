import type { Metadata } from "next";
import { GalleryContent } from "@/components/pages/gallery-content";
import { listPublishedDesignIdeas } from "@/features/design-ideas/design-ideas.repository";

export const metadata: Metadata = {
  title: "Design Gallery",
  description: "Real interior and exterior design inspiration from NEXFORM's design library.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const [en, ar] = await Promise.all([listPublishedDesignIdeas("en"), listPublishedDesignIdeas("ar")]);

  const toCard = (d: (typeof en)[number]) => ({
    slug: d.slug,
    title: d.title,
    description: d.description ?? "",
    category: d.category?.name ?? null,
    roomType: d.roomType,
    coverImageUrl: d.coverImage?.url ?? null,
    featured: d.featured,
    styles: d.styles.map((s) => s.style.name),
  });

  return <GalleryContent items={{ en: en.map(toCard), ar: ar.map(toCard) }} />;
}
