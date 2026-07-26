"use client";

import { useLanguage } from "@/components/language-provider";

export function SkipLink() {
  const { language } = useLanguage();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-ink focus:outline-none"
    >
      {language === "ar" ? "تخطي إلى المحتوى الرئيسي" : "Skip to main content"}
    </a>
  );
}
