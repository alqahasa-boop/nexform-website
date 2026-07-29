import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface WorkspaceInput {
  favoriteStyles?: string[];
  constructionStage?: string;
  budgetMin?: number;
  budgetMax?: number;
  ideas?: string;
  preferences?: Prisma.InputJsonValue;
}

export function getWorkspace(userId: string) {
  return db.aiUserWorkspace.findUnique({ where: { userId } });
}

export function upsertWorkspace(userId: string, input: WorkspaceInput) {
  return db.aiUserWorkspace.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}
