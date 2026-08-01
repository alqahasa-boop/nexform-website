"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Paperclip, Image as ImageIcon, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import type { AiModuleKey } from "@/generated/prisma/client";
import { sendChatMessageAction } from "@/features/ai/conversations/conversations.actions";
import { getAiPublicStatusAction } from "@/features/ai/settings/settings.actions";
import { uploadDocumentAction, analyzeDocumentAction } from "@/features/ai/documents/documents.actions";
import { uploadImageForAnalysisAction, analyzeImageAction } from "@/features/ai/images/images.actions";
import { aiSearchAction, type AiSearchResultItem } from "@/features/ai/search/search.actions";
import { QuoteRequestDialog } from "@/components/quote-request-dialog";
import { useAiWidget } from "@/components/ai/ai-widget-provider";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const COPY = {
  en: {
    launcherLabel: "Open NEXFORM AI Assistant",
    title: "NEXFORM AI Assistant",
    subtitle: "Ask about projects, construction, or your build.",
    generalChat: "General",
    constructionAdvisor: "Construction",
    search: "Search",
    searchPlaceholder: "Search projects, services, articles…",
    searchEmpty: "No matches yet — try different words.",
    searchHint: "Start typing to search NEXFORM's knowledge base.",
    placeholder: "Type your question…",
    notConfigured: "The AI assistant isn't configured yet — an administrator needs to add a provider API key. You can still browse NEXFORM or request a quote below.",
    requestQuote: "Request a Quote",
    uploadDoc: "Analyze a document",
    uploadImage: "Analyze an image",
    disclaimer: "AI assistance only — not a substitute for a licensed engineer.",
    analyzing: "Analyzing…",
    recommendedServices: "Related services",
    recommendedCompanies: "Recommended offices",
    relatedArticles: "Related articles",
  },
  ar: {
    launcherLabel: "افتح مساعد نكسفورم الذكي",
    title: "مساعد نكسفورم الذكي",
    subtitle: "اسأل عن المشاريع أو البناء أو مشروعك.",
    generalChat: "عام",
    constructionAdvisor: "إنشائي",
    search: "بحث",
    searchPlaceholder: "ابحث في المشاريع والخدمات والمقالات…",
    searchEmpty: "لا توجد نتائج — جرّب كلمات مختلفة.",
    searchHint: "ابدأ الكتابة للبحث في قاعدة معرفة نكسفورم.",
    placeholder: "اكتب سؤالك…",
    notConfigured: "المساعد الذكي غير مُفعّل بعد — يحتاج المسؤول لإضافة مفتاح مزود الخدمة. يمكنك تصفح نكسفورم أو طلب عرض سعر أدناه.",
    requestQuote: "طلب عرض سعر",
    uploadDoc: "تحليل مستند",
    uploadImage: "تحليل صورة",
    disclaimer: "مساعدة ذكاء اصطناعي فقط — لا تغني عن مهندس مرخّص.",
    analyzing: "جارٍ التحليل…",
    recommendedServices: "خدمات ذات صلة",
    recommendedCompanies: "مكاتب موصى بها",
    relatedArticles: "مقالات ذات صلة",
  },
};

export function AiWidget() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const t = COPY[language];

  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"chat" | "search">("chat");
  const [module, setModule] = useState<AiModuleKey>("GENERAL_CHAT");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AiSearchResultItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearchTransition] = useTransition();
  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { request, clearRequest } = useAiWidget();

  useEffect(() => {
    if (pathname?.startsWith("/knowledge/build-journey")) setModule("BUILD_JOURNEY_ASSISTANT");
  }, [pathname]);

  useEffect(() => {
    if (!request) return;
    setOpen(true);
    setMode(request.mode ?? "chat");
    if (request.module) setModule(request.module);
    if (request.prefillMessage) setInput(request.prefillMessage);
    clearRequest();
  }, [request, clearRequest]);

  useEffect(() => {
    if (open && configured === null) {
      getAiPublicStatusAction().then((result) => {
        if (result.success) setConfigured(result.data.configured);
      });
    }
  }, [open, configured]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);

    startTransition(async () => {
      const result = await sendChatMessageAction({ conversationId, module, content, language });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setConversationId(result.data.conversationId);
      if (result.data.status === "not_configured") {
        setConfigured(false);
        setMessages((prev) => [...prev, { role: "system", content: t.notConfigured }]);
      } else if (result.data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.data.reply! }]);
      }
    });
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    startSearchTransition(async () => {
      const result = await aiSearchAction(query, language);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSearchResults(result.data);
    });
  };

  const handleDocumentUpload = (file: File) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const uploadResult = await uploadDocumentAction(formData);
      if (!uploadResult.success) {
        toast.error(uploadResult.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "user", content: `📄 ${uploadResult.data.fileName}` }]);
      if (uploadResult.data.analysisStatus === "NOT_CONFIGURED") {
        setConfigured(false);
        setMessages((prev) => [...prev, { role: "system", content: t.notConfigured }]);
        return;
      }
      const analysis = await analyzeDocumentAction(uploadResult.data.id, "Summarize this document.", language);
      if (analysis.success && analysis.data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: analysis.data.response! }]);
        if (analysis.data.relatedArticles.length > 0) {
          const list = analysis.data.relatedArticles.map((a) => a.title).join(", ");
          setMessages((prev) => [...prev, { role: "system", content: `${t.relatedArticles}: ${list}` }]);
        }
      } else if (analysis.success) {
        setConfigured(false);
        setMessages((prev) => [...prev, { role: "system", content: t.notConfigured }]);
      } else {
        toast.error(analysis.error);
      }
    });
  };

  const handleImageUpload = (file: File) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const uploadResult = await uploadImageForAnalysisAction(formData);
      if (!uploadResult.success) {
        toast.error(uploadResult.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "user", content: `🖼️ ${uploadResult.data.fileName}` }]);
      if (uploadResult.data.analysisStatus === "NOT_CONFIGURED") {
        setConfigured(false);
        setMessages((prev) => [...prev, { role: "system", content: t.notConfigured }]);
        return;
      }
      const analysis = await analyzeImageAction(uploadResult.data.id, "", language);
      if (analysis.success && analysis.data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: analysis.data.response! }]);
        const { recommendedServices, recommendedCompanies } = analysis.data;
        if (recommendedServices.length > 0 || recommendedCompanies.length > 0) {
          const parts: string[] = [];
          if (recommendedServices.length > 0) parts.push(`${t.recommendedServices}: ${recommendedServices.map((s) => s.title).join(", ")}`);
          if (recommendedCompanies.length > 0) parts.push(`${t.recommendedCompanies}: ${recommendedCompanies.map((c) => c.name).join(", ")}`);
          setMessages((prev) => [...prev, { role: "system", content: parts.join("\n") }]);
        }
      } else if (analysis.success) {
        setConfigured(false);
        setMessages((prev) => [...prev, { role: "system", content: t.notConfigured }]);
      } else {
        toast.error(analysis.error);
      }
    });
  };

  return (
    <div className={cn("fixed bottom-24 z-[60] md:bottom-5", language === "ar" ? "left-5" : "right-5")}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="mb-3 flex h-[520px] w-[360px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
              <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1.5 border-b border-border px-4 py-2">
              {(
                [
                  ["GENERAL_CHAT", t.generalChat],
                  ["CONSTRUCTION_ADVISOR", t.constructionAdvisor],
                ] as [AiModuleKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setMode("chat");
                    setModule(key);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    mode === "chat" && module === key
                      ? "bg-ai text-ai-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setMode("search")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  mode === "search" ? "bg-ai text-ai-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Search className="size-3" />
                {t.search}
              </button>
            </div>

            {mode === "search" ? (
              <>
                <div className="border-b border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      placeholder={t.searchPlaceholder}
                      className="h-9"
                    />
                    <Button size="icon-sm" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} aria-label="Search">
                      {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {searchResults === null && <p className="text-center text-xs text-muted-foreground">{t.searchHint}</p>}
                  {searchResults?.length === 0 && <p className="text-center text-xs text-muted-foreground">{t.searchEmpty}</p>}
                  {searchResults?.map((result, i) => (
                    <a
                      key={i}
                      href={result.href}
                      className="block rounded-xl border border-border p-3 text-sm transition-colors hover:border-ai/40 hover:bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{result.title}</p>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {result.entityType}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.snippet}</p>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 && configured === false && (
                    <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">{t.notConfigured}</p>
                  )}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                        m.role === "user" && "ms-auto bg-ai text-ai-foreground",
                        m.role === "assistant" && "bg-muted text-foreground",
                        m.role === "system" && "mx-auto bg-muted/60 text-center text-xs text-muted-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                  ))}
                  {isPending && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      {t.analyzing}
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      <input
                        ref={docInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleDocumentUpload(e.target.files[0])}
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                      <Button size="icon-sm" variant="ghost" title={t.uploadDoc} onClick={() => docInputRef.current?.click()} disabled={isPending}>
                        <FileText className="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" title={t.uploadImage} onClick={() => imageInputRef.current?.click()} disabled={isPending}>
                        <ImageIcon className="size-4" />
                      </Button>
                    </div>
                    <QuoteRequestDialog
                      trigger={
                        <Button size="sm" variant="outline" className="text-xs">
                          <Paperclip className="size-3" />
                          {t.requestQuote}
                        </Button>
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={t.placeholder}
                      rows={1}
                      className="max-h-24 min-h-9 resize-none py-2"
                      disabled={isPending}
                    />
                    <Button size="icon-sm" onClick={handleSend} disabled={isPending || !input.trim()} aria-label="Send">
                      <Send className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">{t.disclaimer}</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.launcherLabel}
        className="size-14 rounded-full bg-ai text-ai-foreground shadow-xl shadow-ai/30 hover:bg-ai/90"
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </Button>
    </div>
  );
}
