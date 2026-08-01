"use client";

import { useLanguage } from "@/components/language-provider";
import { StatCounter } from "@/components/sections/stat-counter";

export function Stats() {
  const { t } = useLanguage();

  return (
    <section className="relative py-10 sm:py-12 bg-background border-y border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
          {t.stats.items.map((item) => (
            <StatCounter key={item.label} value={item.value} label={item.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
