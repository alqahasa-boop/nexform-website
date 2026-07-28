import { db } from "@/lib/db";
import type { CreateFaqItemInput, UpdateFaqItemInput } from "./types";

export function listFaqItems(language = "en", publishedOnly = true, category?: string) {
  return db.faqItem.findMany({
    where: { language, ...(publishedOnly && { isPublished: true }), ...(category && { category }) },
    orderBy: { order: "asc" },
  });
}

export function createFaqItem(input: CreateFaqItemInput) {
  return db.faqItem.create({ data: input });
}

export function updateFaqItem(id: string, input: UpdateFaqItemInput) {
  return db.faqItem.update({ where: { id }, data: input });
}

export function deleteFaqItem(id: string) {
  return db.faqItem.delete({ where: { id } });
}

/** Persists a new drag-and-drop order — `orderedIds[i]` becomes order `i`. */
export function reorderFaqItems(orderedIds: string[]) {
  return db.$transaction(orderedIds.map((id, index) => db.faqItem.update({ where: { id }, data: { order: index } })));
}
