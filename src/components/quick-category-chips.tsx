"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function QuickCategoryChips() {
  const { t } = useLanguage();
  const c = t.quickCategories;

  const chips: { label: string; href: string }[] = [
    { label: c.interiorDesign, href: "/studio/interior" },
    { label: c.facades, href: "/studio/exterior" },
    { label: c.majlis, href: "/gallery" },
    { label: c.kitchens, href: "/gallery" },
    { label: c.floorPlans, href: "/studio/interior" },
    { label: c.constructionJourney, href: "/knowledge/build-journey" },
    { label: c.knowledgeLibrary, href: "/knowledge/library" },
    { label: c.engineeringCompanies, href: "/companies" },
    { label: c.projects, href: "/projects" },
    { label: c.aiStudio, href: "/studio" },
  ];

  return (
    <div className="scrollbar-none flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 sm:justify-center sm:px-0">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="snap-start shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-gold/50 hover:text-gold"
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
