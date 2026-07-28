import type { Metadata } from "next";
import { LibraryContent } from "@/components/pages/library-content";

export const metadata: Metadata = {
  title: "Construction Library",
  description: "Reference documents, codes, contracts, and files for building in Kuwait — organized in one place.",
};

export default function LibraryPage() {
  return <LibraryContent />;
}
