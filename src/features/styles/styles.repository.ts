import { db } from "@/lib/db";

export function listStyles() {
  return db.style.findMany({ orderBy: { name: "asc" } });
}

export async function findStyleIdsByNames(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const rows = await db.style.findMany({ where: { name: { in: names } }, select: { id: true } });
  return rows.map((r) => r.id);
}
