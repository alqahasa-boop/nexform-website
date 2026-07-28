import type { Metadata } from "next";
import { KnowledgeContent } from "@/components/pages/knowledge-content";

export const metadata: Metadata = {
  title: "Knowledge Center",
  description: "Resources to help you understand every stage of building a home in Kuwait, from NEXFORM.",
};

export default function KnowledgePage() {
  return <KnowledgeContent />;
}
