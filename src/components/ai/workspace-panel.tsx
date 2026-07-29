"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Save, Trash2, Archive, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { updateMyWorkspaceAction } from "@/features/ai/workspace/workspace.actions";
import { archiveConversationAction, deleteConversationAction } from "@/features/ai/conversations/conversations.actions";
import type { WorkspaceOverview } from "@/features/ai/workspace/workspace.actions";

const CONSTRUCTION_STAGES = ["planning", "design", "permits", "foundation", "structure", "finishing", "complete"];

const MODULE_LABELS: Record<string, { en: string; ar: string }> = {
  GENERAL_CHAT: { en: "General Chat", ar: "محادثة عامة" },
  CONSTRUCTION_ADVISOR: { en: "Construction Advisor", ar: "مستشار البناء" },
  BUILD_JOURNEY_ASSISTANT: { en: "Build Journey", ar: "رحلة البناء" },
  DOCUMENT_AI: { en: "Document AI", ar: "تحليل المستندات" },
  IMAGE_AI: { en: "Image AI", ar: "تحليل الصور" },
  KNOWLEDGE_SEARCH: { en: "Knowledge Search", ar: "بحث المعرفة" },
};

export function WorkspacePanel({ overview }: { overview: WorkspaceOverview }) {
  const { language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [conversations, setConversations] = useState(overview.recentConversations);
  const [favoriteStyles, setFavoriteStyles] = useState((overview.workspace?.favoriteStyles ?? []).join(", "));
  const [constructionStage, setConstructionStage] = useState(overview.workspace?.constructionStage ?? "");
  const [budgetMin, setBudgetMin] = useState(overview.workspace?.budgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(overview.workspace?.budgetMax?.toString() ?? "");
  const [ideas, setIdeas] = useState(overview.workspace?.ideas ?? "");

  const copy =
    language === "ar"
      ? {
          title: "مساحة العمل الذكية",
          subtitle: "يتذكر المساعد الذكي هذه التفاصيل لتقديم إرشادات أكثر دقة.",
          styles: "الأنماط المفضلة (مفصولة بفواصل)",
          stage: "مرحلة البناء الحالية",
          stageNone: "غير محدد",
          budgetMin: "الحد الأدنى للميزانية (د.ك)",
          budgetMax: "الحد الأقصى للميزانية (د.ك)",
          ideas: "أفكار وملاحظات",
          save: "حفظ التفضيلات",
          saved: "تم حفظ التفضيلات",
          conversations: "المحادثات الأخيرة",
          noConversations: "لا توجد محادثات بعد — ابدأ بفتح المساعد الذكي.",
          files: "الملفات المرفوعة",
          archive: "أرشفة",
          delete: "حذف",
        }
      : {
          title: "AI Workspace",
          subtitle: "The AI assistant remembers these details to give you more relevant guidance.",
          styles: "Favorite styles (comma-separated)",
          stage: "Current construction stage",
          stageNone: "Not set",
          budgetMin: "Budget minimum (KWD)",
          budgetMax: "Budget maximum (KWD)",
          ideas: "Ideas & notes",
          save: "Save preferences",
          saved: "Preferences saved",
          conversations: "Recent conversations",
          noConversations: "No conversations yet — open the AI assistant to get started.",
          files: "Uploaded files",
          archive: "Archive",
          delete: "Delete",
        };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateMyWorkspaceAction({
        favoriteStyles: favoriteStyles
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        constructionStage: constructionStage || undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        ideas: ideas || undefined,
      });
      if (result.success) toast.success(copy.saved);
      else toast.error(result.error);
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const result = await archiveConversationAction(id);
      if (result.success) setConversations((prev) => prev.filter((c) => c.id !== id));
      else toast.error(result.error);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteConversationAction(id);
      if (result.success) setConversations((prev) => prev.filter((c) => c.id !== id));
      else toast.error(result.error);
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="ws-styles">{copy.styles}</Label>
          <Input id="ws-styles" value={favoriteStyles} onChange={(e) => setFavoriteStyles(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ws-stage">{copy.stage}</Label>
          <select
            id="ws-stage"
            value={constructionStage}
            onChange={(e) => setConstructionStage(e.target.value)}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">{copy.stageNone}</option>
            {CONSTRUCTION_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ws-budget-min">{copy.budgetMin}</Label>
            <Input id="ws-budget-min" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-budget-max">{copy.budgetMax}</Label>
            <Input id="ws-budget-max" type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ws-ideas">{copy.ideas}</Label>
          <Textarea id="ws-ideas" rows={4} value={ideas} onChange={(e) => setIdeas(e.target.value)} />
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {copy.save}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{copy.conversations}</h2>
          <span className="text-xs text-muted-foreground">
            {copy.files}: {overview.uploadedFileCount}
          </span>
        </div>

        {conversations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {copy.noConversations}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {conversations.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.title ?? MODULE_LABELS[c.module]?.[language] ?? c.module}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => handleArchive(c.id)} title={copy.archive} disabled={isPending}>
                    <Archive className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(c.id)} title={copy.delete} disabled={isPending}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/" className="inline-block text-sm text-primary hover:underline">
        {language === "ar" ? "العودة إلى الرئيسية" : "Back to home"}
      </Link>
    </div>
  );
}
