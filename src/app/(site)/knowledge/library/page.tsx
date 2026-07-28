import type { Metadata } from "next";
import { LibraryContent } from "@/components/pages/library-content";
import { listPublishedLibraryCategories } from "@/features/construction-library/construction-library.repository";

export const metadata: Metadata = {
  title: "Construction Library",
  description: "Reference documents, codes, contracts, and files for building in Kuwait — organized in one place.",
};

export const revalidate = 60;

export default async function LibraryPage() {
  const [en, ar] = await Promise.all([
    listPublishedLibraryCategories("en"),
    listPublishedLibraryCategories("ar"),
  ]);

  const toCategory = (c: (typeof en)[number]) => ({
    title: c.name,
    description: c.description ?? "",
    count: c._count.items,
  });

  return <LibraryContent categories={{ en: en.map(toCategory), ar: ar.map(toCategory) }} />;
}
