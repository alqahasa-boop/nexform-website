"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, LogOut, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface SavedDesign {
  slug: string;
  language: string;
  title: string;
  category: string | null;
  coverImageUrl: string | null;
}

interface DesignRequestSummary {
  id: string;
  requestNumber: string;
  status: string;
  serviceName: string | null;
  createdAt: string;
}

export function DashboardCopy({
  name,
  email,
  savedDesigns,
  designRequests,
  logoutAction,
}: {
  name?: string | null;
  email: string;
  savedDesigns: SavedDesign[];
  designRequests: DesignRequestSummary[];
  logoutAction: () => Promise<void>;
}) {
  const { t, language } = useLanguage();
  const a = t.account;

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">{a.dashboardTitle}</p>
          <h1 className="font-heading mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
            {a.welcomeBack}
            {name ? `, ${name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-gold/50 hover:text-gold"
          >
            <LogOut className="size-4" />
            {a.signOut}
          </button>
        </form>
      </div>

      <section>
        <h2 className="font-heading text-lg font-medium">{a.savedDesigns}</h2>
        {savedDesigns.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <Heart className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">{a.noSavedDesigns}</p>
            <Link
              href="/gallery"
              className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              {a.browseGallery}
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {savedDesigns
              .filter((d) => d.language === language)
              .map((d) => (
                <Link
                  key={d.slug}
                  href="/gallery"
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-gold-soft/40">
                    {d.coverImageUrl && (
                      <Image
                        src={d.coverImageUrl}
                        alt={d.title}
                        fill
                        className="object-cover object-right transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    {d.category && <p className="text-[10px] font-medium uppercase tracking-widest text-gold">{d.category}</p>}
                    <p className="mt-0.5 truncate text-sm font-medium">{d.title}</p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-lg font-medium">{a.myRequests}</h2>
        {designRequests.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <Sparkles className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">{a.noRequests}</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {designRequests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {a.requestNumber} #{r.requestNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.serviceName ?? "—"} · {new Date(r.createdAt).toLocaleDateString(language === "ar" ? "ar-KW" : "en-US")}
                  </p>
                </div>
                <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold">
                  {r.status.replaceAll("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
