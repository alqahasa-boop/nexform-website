"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Mic, Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAiWidget } from "@/components/ai/ai-widget-provider";
import { aiSearchAction, type AiSearchResultItem } from "@/features/ai/search/search.actions";
import { cn } from "@/lib/utils";

// Minimal ambient types for the native Web Speech API — no library needed, and unsupported browsers simply won't expose these.
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onend: (() => void) | null;
}

export function HeroSearchBar() {
  const { language } = useLanguage();
  const { openWidget } = useAiWidget();
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AiSearchResultItem[] | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = language === "ar" ? "ar-KW" : "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) setQuery(transcript);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setResults(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copy =
    language === "ar"
      ? {
          placeholder: "ابحث عن مخططات، تصميم داخلي، واجهات، مقالات أو اسأل الذكاء الاصطناعي…",
          askAi: "اسأل الذكاء الاصطناعي",
          noResults: "لا توجد نتائج بعد — جرّب كلمات مختلفة أو اسأل الذكاء الاصطناعي مباشرة.",
        }
      : {
          placeholder: "Search floor plans, interior design, facades, articles or ask AI…",
          askAi: "Ask AI",
          noResults: "No matches yet — try different words, or ask AI directly.",
        };

  const handleSearch = () => {
    if (!query.trim()) return;
    startSearch(async () => {
      const res = await aiSearchAction(query.trim(), language);
      setResults(res.success ? res.data : []);
    });
  };

  const handleVoice = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  };

  const handleAskAi = () => {
    openWidget({ module: "GENERAL_CHAT", mode: "chat", prefillMessage: query.trim() || undefined });
    setResults(null);
  };

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 py-2 ps-5 pe-2 shadow-xl shadow-black/20 backdrop-blur-xl">
        <Search className="size-5 shrink-0 text-white/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder={copy.placeholder}
          className="h-10 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none sm:text-base"
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={handleVoice}
            aria-label="Voice search"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white",
              listening && "text-ai"
            )}
          >
            <Mic className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleAskAi}
          aria-label={copy.askAi}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ai text-ai-foreground transition-transform hover:scale-105"
        >
          <Sparkles className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          aria-label="Search"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform hover:scale-105 disabled:opacity-40"
        >
          {isSearching ? <Loader2 className="size-4 animate-spin" /> : <ArrowIcon className="size-4" />}
        </button>
      </div>

      {results !== null && (
        <div className="glass absolute inset-x-0 top-full z-20 mt-3 max-h-80 overflow-y-auto rounded-2xl p-2 text-start shadow-2xl">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{copy.noResults}</p>
          ) : (
            results.map((r, i) => (
              <a
                key={i}
                href={r.href}
                className="block rounded-xl px-4 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{r.entityType}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.snippet}</p>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
