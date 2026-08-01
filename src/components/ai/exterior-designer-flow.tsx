"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { uploadImageForAnalysisAction } from "@/features/ai/images/images.actions";
import { generateExteriorConceptAction, type ConceptResult } from "@/features/ai/concepts/exterior-designer.actions";
import { EXTERIOR_STYLES } from "@/features/ai/concepts/exterior-styles";
import { matchCompaniesAction, type MatchedCompany } from "@/features/ai/companies/company-matching.actions";
import { MatchedCompaniesList } from "@/components/ai/matched-companies-list";
import { QuoteRequestDialog } from "@/components/quote-request-dialog";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ExteriorDesignerFlow() {
  const { language } = useLanguage();
  const [isUploading, startUpload] = useTransition();
  const [isGenerating, startGenerate] = useTransition();
  const [facadeFileId, setFacadeFileId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<string>(EXTERIOR_STYLES[0]);
  const [notes, setNotes] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [companies, setCompanies] = useState<MatchedCompany[]>([]);
  const [companiesNarrative, setCompaniesNarrative] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copy =
    language === "ar"
      ? {
          title: "مصمم الواجهات الذكي",
          subtitle: "ارفع صورة الواجهة واختر الأسلوب المطلوب.",
          upload: "رفع صورة الواجهة",
          style: "الأسلوب المستهدف",
          notes: "ملاحظات إضافية",
          budgetMin: "الحد الأدنى للميزانية (د.ك)",
          budgetMax: "الحد الأقصى للميزانية (د.ك)",
          generate: "إنشاء المفهوم",
          generating: "جارٍ التحليل…",
          notConfigured: "المساعد الذكي غير مُفعّل بعد. يمكنك طلب عرض سعر مباشرة.",
          inspiration: "إلهام من معرض نكسفورم",
          cta: "حوّل هذا المفهوم إلى تصميم هندسي احترافي",
          requestQuote: "طلب عرض سعر",
        }
      : {
          title: "AI Exterior Designer",
          subtitle: "Upload a facade photo and pick a target style.",
          upload: "Upload facade photo",
          style: "Target style",
          notes: "Additional notes",
          budgetMin: "Budget minimum (KWD)",
          budgetMax: "Budget maximum (KWD)",
          generate: "Generate Concept",
          generating: "Analyzing…",
          notConfigured: "The AI assistant isn't configured yet. You can request a quote directly.",
          inspiration: "Inspiration from the NEXFORM gallery",
          cta: "Transform this concept into a professional engineering design.",
          requestQuote: "Request a Quote",
        };

  const handleUpload = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const res = await uploadImageForAnalysisAction(formData);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setFacadeFileId(res.data.id);
    });
  };

  const handleGenerate = () => {
    if (!facadeFileId) return;
    startGenerate(async () => {
      const res = await generateExteriorConceptAction({
        facadeFileId,
        style,
        notes: notes || undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        language,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setResult(res.data);

      const matchRes = await matchCompaniesAction({
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        language,
      });
      if (matchRes.success) {
        setCompanies(matchRes.data.companies);
        setCompaniesNarrative(matchRes.data.narrative);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-28 sm:pt-32">
      <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>

      <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 hover:border-ai/40"
        >
          {previewUrl ? (
            <Image src={previewUrl} alt="Facade preview" fill className="object-cover" unoptimized />
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Upload className="size-6" />
              {copy.upload}
            </span>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
        </button>

        <div className="space-y-2">
          <Label>{copy.style}</Label>
          <select className={selectClass} value={style} onChange={(e) => setStyle(e.target.value)}>
            {EXTERIOR_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{copy.budgetMin}</Label>
            <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{copy.budgetMax}</Label>
            <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{copy.notes}</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button onClick={handleGenerate} disabled={!facadeFileId || isUploading || isGenerating}>
          {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {isGenerating ? copy.generating : copy.generate}
        </Button>

        {result && (
          <div className="space-y-5 border-t border-border pt-5">
            {result.status === "not_configured" && (
              <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{copy.notConfigured}</p>
            )}
            {result.generatedText && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">{result.generatedText}</div>
            )}
            {result.inspiration.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">{copy.inspiration}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {result.inspiration.map((idea) => (
                    <div key={idea.id} className="overflow-hidden rounded-lg border border-border">
                      <div className="relative aspect-square bg-muted">
                        {idea.imageUrl && <Image src={idea.imageUrl} alt={idea.title} fill className="object-cover" sizes="150px" />}
                      </div>
                      <p className="truncate p-1.5 text-[11px] text-muted-foreground">{idea.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-ai/30 bg-ai-soft/40 p-4">
              <p className="text-sm font-medium text-foreground">{copy.cta}</p>
              <QuoteRequestDialog
                trigger={
                  <Button size="sm" className="mt-3">
                    {copy.requestQuote}
                  </Button>
                }
                prefill={{ conceptId: result.conceptId }}
              />
            </div>
            <MatchedCompaniesList companies={companies} narrative={companiesNarrative} conceptId={result.conceptId} />
          </div>
        )}
      </div>
    </div>
  );
}
