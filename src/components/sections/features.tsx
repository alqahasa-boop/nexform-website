import { FeaturedCategoryCards } from "@/components/featured-category-cards";

/**
 * Replaced the generic 6-service icon grid with real, large image category
 * cards (Interior/Facade/Majlis/Kitchen) per the redesign spec — logic lives
 * in `FeaturedCategoryCards`, kept as its own component so it's reusable
 * outside the homepage later if needed. This file keeps its original name/
 * export so `src/app/(site)/page.tsx` doesn't need to change.
 */
export function Features() {
  return <FeaturedCategoryCards />;
}
