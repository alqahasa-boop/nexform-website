import type { Metadata } from "next";
import { ExteriorDesignerFlow } from "@/components/ai/exterior-designer-flow";

export const metadata: Metadata = {
  title: "AI Exterior Designer",
  description: "Upload a facade photo and get an AI-generated exterior concept grounded in NEXFORM's real design gallery.",
};

export default function ExteriorDesignerPage() {
  return <ExteriorDesignerFlow />;
}
