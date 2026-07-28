import type { Metadata } from "next";
import { ProjectsContent } from "@/components/pages/projects-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "A growing portfolio of NEXFORM's residential, commercial, interior, facade, and luxury villa projects.",
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
