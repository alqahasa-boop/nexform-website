import { db } from "@/lib/db";
import type { CategoryType } from "@/generated/prisma/client";
import type { CreateCategoryInput, UpdateCategoryInput } from "./types";

export function listCategories(type?: CategoryType) {
  return db.category.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { children: true },
  });
}

export function getCategoryBySlug(type: CategoryType, slug: string) {
  return db.category.findUnique({ where: { type_slug: { type, slug } } });
}

export function createCategory(input: CreateCategoryInput) {
  return db.category.create({ data: input });
}

export function updateCategory(id: string, input: UpdateCategoryInput) {
  return db.category.update({ where: { id }, data: input });
}

export function deleteCategory(id: string) {
  return db.category.delete({ where: { id } });
}
