"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sofa,
  Building,
  ScanEye,
  FileText,
  HardHat,
  Sparkles,
  Compass,
  Route,
  Calculator,
  Layers,
  Search,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { useAiWidget } from "@/components/ai/ai-widget-provider";
import type { AiModuleKey } from "@/generated/prisma/client";
import type { RecommendationsResult } from "@/features/ai/recommendations/recommendations.actions";

interface RecentConversation {
  id: string;
  module: AiModuleKey;
  title: string | null;
  updatedAt: Date;
}

interface RecentConcept {
  id: string;
  kind: "INTERIOR" | "EXTERIOR";
  roomType: string | null;
  status: string;
  createdAt: Date;
}

export function StudioHub({
  recentConversations,
  recentConcepts,
  recommendations,
}: {
  recentConversations: RecentConversation[];
  recentConcepts: RecentConcept[];
  recommendations: { en: RecommendationsResult | null; ar: RecommendationsResult | null };
}) {
  const { language } = useLanguage();
  const router = useRouter();
  const { openWidget } = useAiWidget();
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const recs = recommendations[language];

  const copy =
    language === "ar"
      ? {
          title: "استوديو نكسفورم الذكي",
          subtitle: "نقطة انطلاقك لكل ما هو هندسي وتصميمي في نكسفورم.",
          placeholder: "اسأل أي شيء عن مشروعك…",
          send: "إرسال",
          quickActions: "إجراءات سريعة",
          recentConversations: "المحادثات الأخيرة",
          recentConcepts: "المفاهيم الأخيرة",
          recommended: "موصى به لك",
          recommendedPersonalized: "بناءً على تفضيلاتك المحفوظة",
          empty: "لا يوجد نشاط بعد — جرّب أحد الإجراءات أعلاه.",
          actions: [
            { icon: Sofa, label: "تصميم داخلي", href: "/studio/interior" },
            { icon: Building, label: "تصميم خارجي", href: "/studio/exterior" },
            { icon: ScanEye, label: "تحليل صورة", action: "image" },
            { icon: FileText, label: "شرح مستند", action: "document" },
            { icon: HardHat, label: "أسئلة إنشائية", action: "construction" },
            { icon: Sparkles, label: "إلهام", href: "/gallery" },
            { icon: Compass, label: "استكشف المشاريع", href: "/projects" },
            { icon: Route, label: "رحلة البناء", href: "/knowledge/build-journey" },
            { icon: Calculator, label: "تقدير الميزانية", action: "budget" },
            { icon: Layers, label: "مقارنة المواد", action: "materials" },
            { icon: Search, label: "البحث عن شركات", href: "/companies" },
          ],
        }
      : {
          title: "NEXFORM AI Studio",
          subtitle: "Your starting point for everything engineering and design at NEXFORM.",
          placeholder: "Ask anything about your project…",
          send: "Send",
          quickActions: "Quick Actions",
          recentConversations: "Recent Conversations",
          recentConcepts: "Recent Concepts",
          recommended: "Recommended for You",
          recommendedPersonalized: "Based on your saved preferences",
          empty: "No activity yet — try one of the actions above.",
          actions: [
            { icon: Sofa, label: "Interior Design", href: "/studio/interior" },
            { icon: Building, label: "Exterior Design", href: "/studio/exterior" },
            { icon: ScanEye, label: "Analyze Image", action: "image" },
            { icon: FileText, label: "Explain Document", action: "document" },
            { icon: HardHat, label: "Construction Questions", action: "construction" },
            { icon: Sparkles, label: "Find Inspiration", href: "/gallery" },
            { icon: Compass, label: "Explore Projects", href: "/projects" },
            { icon: Route, label: "Build Journey", href: "/knowledge/build-journey" },
            { icon: Calculator, label: "Estimate Budget", action: "budget" },
            { icon: Layers, label: "Compare Materials", action: "materials" },
            { icon: Search, label: "Search Companies", href: "/companies" },
          ],
        };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "image":
        openWidget({ module: "IMAGE_AI", mode: "chat" });
        break;
      case "document":
        openWidget({ module: "DOCUMENT_AI", mode: "chat" });
        break;
      case "construction":
        openWidget({ module: "CONSTRUCTION_ADVISOR", mode: "chat" });
        break;
      case "budget":
        openWidget({ module: "GENERAL_CHAT", mode: "chat", prefillMessage: "Help me estimate a budget for my project." });
        break;
      case "materials":
        openWidget({ module: "CONSTRUCTION_ADVISOR", mode: "chat", prefillMessage: "Help me compare construction materials." });
        break;
    }
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    startTransition(() => {
      openWidget({ module: "GENERAL_CHAT", mode: "chat", prefillMessage: prompt });
      setPrompt("");
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
        <p className="mt-2 text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl items-end gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={copy.placeholder}
          rows={1}
          className="max-h-32 min-h-11 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button size="icon" onClick={handleSend} disabled={isPending || !prompt.trim()} aria-label="Send">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{copy.quickActions}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {copy.actions.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:border-ai/40 hover:bg-ai-soft/30 hover:shadow-md">
                <Icon className="size-6 text-ai" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            );
            return item.href ? (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            ) : (
              <button key={item.label} onClick={() => handleQuickAction(item.action!)} className="text-start">
                {content}
              </button>
            );
          })}
        </div>
      </div>

      {recs && (recs.projects.length > 0 || recs.designIdeas.length > 0 || recs.companies.length > 0 || recs.services.length > 0) && (
        <div className="mt-12">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{copy.recommended}</h2>
          {recs.personalized && <p className="mb-3 text-xs text-muted-foreground">{copy.recommendedPersonalized}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...recs.designIdeas, ...recs.projects, ...recs.companies, ...recs.services].slice(0, 8).map((item) => (
              <Link key={`${item.href}-${item.id}`} href={item.href} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-square bg-muted">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="150px" />}
                </div>
                <p className="truncate p-2 text-xs text-foreground">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{copy.recentConversations}</h2>
          {recentConversations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{copy.empty}</p>
          ) : (
            <ul className="space-y-2">
              {recentConversations.map((c) => (
                <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">{c.title ?? c.module}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{copy.recentConcepts}</h2>
          {recentConcepts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{copy.empty}</p>
          ) : (
            <ul className="space-y-2">
              {recentConcepts.map((c) => (
                <li
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm"
                  onClick={() => router.push(c.kind === "INTERIOR" ? "/studio/interior" : "/studio/exterior")}
                >
                  {c.kind === "INTERIOR" ? <Sofa className="size-4 shrink-0 text-muted-foreground" /> : <Building className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="truncate text-foreground">{c.roomType ?? c.kind}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
