"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

/**
 * "Saved" and "Account" both link to `/customer/dashboard` — the customer
 * account area (distinct from the staff-only `/account/assistant`). Visitors
 * who aren't signed in are redirected to `/customer/login` automatically by
 * the page's own guard, so this component doesn't need to know session state.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const items = [
    { key: "home", href: "/", icon: Home, label: t.mobileNav.home, primary: false },
    { key: "explore", href: "/gallery", icon: Compass, label: t.mobileNav.explore, primary: false },
    { key: "ai", href: "/studio", icon: Sparkles, label: t.mobileNav.ai, primary: true },
    { key: "saved", href: "/customer/dashboard", icon: Bookmark, label: t.mobileNav.saved, primary: false },
    { key: "account", href: "/customer/dashboard", icon: User, label: t.mobileNav.account, primary: false },
  ] as const;

  return (
    <nav
      className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-full px-1.5 py-2 shadow-lg shadow-black/10 md:hidden"
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        if (item.primary) {
          return (
            <Link key={item.key} href={item.href} className="flex flex-1 flex-col items-center gap-1" aria-label={item.label}>
              <span
                className={cn(
                  "-mt-6 flex size-11 items-center justify-center rounded-full bg-ai text-ai-foreground shadow-lg shadow-ai/30 transition-transform",
                  active && "scale-105"
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className={cn("text-[10px] font-medium", active ? "text-ai" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link key={item.key} href={item.href} className="flex flex-1 flex-col items-center gap-1 py-1.5" aria-label={item.label}>
            <Icon className={cn("size-5", active ? "text-gold" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium", active ? "text-gold" : "text-muted-foreground")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
