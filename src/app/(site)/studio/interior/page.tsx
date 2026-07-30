import type { Metadata } from "next";
import { InteriorDesignerFlow } from "@/components/ai/interior-designer-flow";

export const metadata: Metadata = {
  title: "AI Interior Designer",
  description: "A guided AI concept generator for your room, grounded in NEXFORM's real design gallery.",
};

export default function InteriorDesignerPage() {
  return <InteriorDesignerFlow />;
}
