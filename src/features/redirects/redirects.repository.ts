import { db } from "@/lib/db";
import type { CreateRedirectInput } from "./types";

export function listRedirects() {
  return db.redirect.findMany({ orderBy: { createdAt: "desc" } });
}

export function createRedirect(input: CreateRedirectInput) {
  return db.redirect.create({ data: input });
}

export function toggleRedirect(id: string, isActive: boolean) {
  return db.redirect.update({ where: { id }, data: { isActive } });
}

export function deleteRedirect(id: string) {
  return db.redirect.delete({ where: { id } });
}
