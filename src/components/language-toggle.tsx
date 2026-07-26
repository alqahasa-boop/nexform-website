"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ light = false }: { light?: boolean }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className={cn("gap-1.5 text-xs sm:text-sm font-medium tracking-wide", light && "hover:bg-white/10")}
      style={light ? { color: "#fff" } : undefined}
    >
      <Languages className="h-4 w-4" />
      {language === "en" ? "العربية" : "English"}
    </Button>
  );
}
