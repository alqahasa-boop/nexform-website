import type { Metadata } from "next";
import { StudioHub } from "@/components/ai/studio-hub";
import { listMyConversationsAction } from "@/features/ai/conversations/conversations.actions";
import { listMyConceptsAction } from "@/features/ai/concepts/interior-designer.actions";
import { getRecommendationsAction } from "@/features/ai/recommendations/recommendations.actions";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "NEXFORM's AI Studio — interior and exterior design concepts, construction guidance, and inspiration in one place.",
};

export default async function StudioPage() {
  const [conversationsResult, conceptsResult, recommendationsEn, recommendationsAr] = await Promise.all([
    listMyConversationsAction(),
    listMyConceptsAction(),
    getRecommendationsAction("en"),
    getRecommendationsAction("ar"),
  ]);

  const recentConversations = (conversationsResult.success ? conversationsResult.data : []).slice(0, 6).map((c) => ({
    id: c.id,
    module: c.module,
    title: c.title,
    updatedAt: c.updatedAt,
  }));

  const recentConcepts = (conceptsResult.success ? conceptsResult.data : []).slice(0, 6).map((c) => ({
    id: c.id,
    kind: c.kind,
    roomType: c.roomType,
    status: c.status,
    createdAt: c.createdAt,
  }));

  return (
    <StudioHub
      recentConversations={recentConversations}
      recentConcepts={recentConcepts}
      recommendations={{
        en: recommendationsEn.success ? recommendationsEn.data : null,
        ar: recommendationsAr.success ? recommendationsAr.data : null,
      }}
    />
  );
}
