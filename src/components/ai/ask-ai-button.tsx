"use client";

import { Sparkles } from "lucide-react";
import { useAiWidget } from "@/components/ai/ai-widget-provider";
import { useLanguage } from "@/components/language-provider";
import type { AiModuleKey } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

/**
 * Module 13 "contextual AI everywhere" — a small, consistent trigger that
 * opens the one globally-mounted AiWidget pre-seeded with a message about
 * whatever the user is looking at, instead of a separate chat per page.
 */
export function AskAiButton({
  prefillMessage,
  module = "GENERAL_CHAT",
  className,
}: {
  prefillMessage: string;
  module?: AiModuleKey;
  className?: string;
}) {
  const { openWidget } = useAiWidget();
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openWidget({ module, prefillMessage, mode: "chat" });
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-ai/25 bg-ai-soft/60 px-2.5 py-1 text-[11px] font-medium text-ai backdrop-blur-sm transition-colors hover:border-ai/50 hover:bg-ai-soft",
        className
      )}
    >
      <Sparkles className="size-3" />
      {language === "ar" ? "اسأل الذكاء الاصطناعي" : "Ask AI"}
    </button>
  );
}
