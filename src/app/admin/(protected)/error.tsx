"use client";

import { useEffect } from "react";
import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <DatabaseZap className="size-10 text-destructive" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-foreground">Could not load this page</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This usually means the database isn&apos;t connected yet — check <code className="rounded bg-muted px-1">DATABASE_URL</code> in your
        environment and try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
