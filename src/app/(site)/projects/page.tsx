import type { Metadata } from "next";
import { ProjectsContent } from "@/components/pages/projects-content";
import { listPublishedProjects } from "@/features/projects/projects.repository";

export const metadata: Metadata = {
  title: "Projects",
  description: "A growing portfolio of NEXFORM's residential, commercial, interior, facade, and luxury villa projects.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const [en, ar] = await Promise.all([listPublishedProjects("en"), listPublishedProjects("ar")]);

  const toCard = (p: (typeof en)[number]) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? "",
    category: p.category?.name ?? null,
    location: p.location,
    coverImageUrl: p.coverImage?.url ?? null,
  });

  return <ProjectsContent projects={{ en: en.map(toCard), ar: ar.map(toCard) }} />;
}
