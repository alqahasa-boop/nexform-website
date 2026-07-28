import { db } from "@/lib/db";
import type {
  CreateLibraryCategoryInput,
  CreateLibraryItemInput,
  UpdateLibraryCategoryInput,
  UpdateLibraryItemInput,
} from "./types";

export function listLibraryCategories(language = "en") {
  return db.constructionLibraryCategory.findMany({
    where: { language },
    orderBy: { order: "asc" },
    include: { _count: { select: { items: true } } },
  });
}

export function createLibraryCategory(input: CreateLibraryCategoryInput) {
  return db.constructionLibraryCategory.create({ data: input });
}

export function updateLibraryCategory(id: string, input: UpdateLibraryCategoryInput) {
  return db.constructionLibraryCategory.update({ where: { id }, data: input });
}

export function deleteLibraryCategory(id: string) {
  return db.constructionLibraryCategory.delete({ where: { id } });
}

export function listLibraryItems(categoryId?: string, publishedOnly = true) {
  return db.constructionLibraryItem.findMany({
    where: { ...(categoryId && { categoryId }), ...(publishedOnly && { status: "PUBLISHED" }) },
    include: { file: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function createLibraryItem(input: CreateLibraryItemInput) {
  return db.constructionLibraryItem.create({ data: input });
}

export function updateLibraryItem(id: string, input: UpdateLibraryItemInput) {
  return db.constructionLibraryItem.update({ where: { id }, data: input });
}

export function deleteLibraryItem(id: string) {
  return db.constructionLibraryItem.delete({ where: { id } });
}
