"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { AiModuleKey } from "@/generated/prisma/client";

export interface OpenWidgetOptions {
  module?: AiModuleKey;
  prefillMessage?: string;
  mode?: "chat" | "search";
}

interface AiWidgetRequest extends OpenWidgetOptions {
  nonce: number;
}

interface AiWidgetContextValue {
  request: AiWidgetRequest | null;
  openWidget: (opts: OpenWidgetOptions) => void;
  clearRequest: () => void;
}

const AiWidgetContext = createContext<AiWidgetContextValue | null>(null);

/**
 * Lets any page (Project/Service/Company/Gallery cards, FAQ items, Build
 * Journey stages) open the single globally-mounted `AiWidget` pre-seeded
 * with a module and prompt — Module 13 "contextual AI everywhere" without
 * spinning up a separate chat instance per page.
 */
export function AiWidgetProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<AiWidgetRequest | null>(null);

  const openWidget = useCallback((opts: OpenWidgetOptions) => {
    setRequest({ ...opts, nonce: Date.now() });
  }, []);

  const clearRequest = useCallback(() => setRequest(null), []);

  return <AiWidgetContext.Provider value={{ request, openWidget, clearRequest }}>{children}</AiWidgetContext.Provider>;
}

export function useAiWidget() {
  const ctx = useContext(AiWidgetContext);
  if (!ctx) throw new Error("useAiWidget must be used within an AiWidgetProvider");
  return ctx;
}
