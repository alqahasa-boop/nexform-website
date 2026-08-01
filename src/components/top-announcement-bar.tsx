"use client";

import { useLanguage } from "@/components/language-provider";

/**
 * Thin marquee strip fixed above the Navbar. Content is duplicated once so the
 * `translateX(-50%)` keyframe (see .animate-marquee in globals.css) loops
 * seamlessly; direction is always visually left-to-right regardless of
 * language, matching how marquees read on premium sites.
 */
export function TopAnnouncementBar() {
  const { t } = useLanguage();
  const messages = t.announcement;

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden bg-ink text-white/80">
      <div className="flex h-full w-max items-center animate-marquee" dir="ltr">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {messages.map((message, i) => (
              <span key={`${copy}-${i}`} className="flex items-center whitespace-nowrap px-8 text-[11px] font-medium tracking-wide">
                {message}
                <span className="ms-8 text-gold/60">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
