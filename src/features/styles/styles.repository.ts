import { db } from "@/lib/db";

export function listStyles() {
  return db.style.findMany({ orderBy: { name: "asc" } });
}
