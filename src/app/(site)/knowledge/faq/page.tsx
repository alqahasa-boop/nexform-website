import type { Metadata } from "next";
import { FaqContent } from "@/components/pages/faq-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions NEXFORM clients ask most often.",
};

export default function FaqPage() {
  return <FaqContent />;
}
