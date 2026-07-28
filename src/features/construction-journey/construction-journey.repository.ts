import { db } from "@/lib/db";
import type { CreateJourneyStageInput, UpdateJourneyStageInput } from "./types";

export function listJourneyStages(language = "en", publishedOnly = true) {
  return db.constructionJourneyStage.findMany({
    where: { language, ...(publishedOnly && { status: "PUBLISHED" }) },
    orderBy: { order: "asc" },
  });
}

export function createJourneyStage(input: CreateJourneyStageInput) {
  return db.constructionJourneyStage.create({ data: input });
}

export function updateJourneyStage(id: string, input: UpdateJourneyStageInput) {
  return db.constructionJourneyStage.update({ where: { id }, data: input });
}

export function reorderJourneyStages(orderedIds: string[]) {
  return db.$transaction(
    orderedIds.map((id, index) => db.constructionJourneyStage.update({ where: { id }, data: { order: index } }))
  );
}

export function deleteJourneyStage(id: string) {
  return db.constructionJourneyStage.delete({ where: { id } });
}
