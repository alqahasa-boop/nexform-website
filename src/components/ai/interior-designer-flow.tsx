"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { generateInteriorConceptAction, type InteriorDesignerInput, type ConceptResult } from "@/features/ai/concepts/interior-designer.actions";
import { matchCompaniesAction, type MatchedCompany } from "@/features/ai/companies/company-matching.actions";
import { MatchedCompaniesList } from "@/components/ai/matched-companies-list";
import { QuoteRequestDialog } from "@/components/quote-request-dialog";

const ROOM_TYPES = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Majlis", "Home Office", "Dining Room"];

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function InteriorDesignerFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [companies, setCompanies] = useState<MatchedCompany[]>([]);
  const [companiesNarrative, setCompaniesNarrative] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<InteriorDesignerInput>>({ roomType: ROOM_TYPES[0] });
  const set = <K extends keyof InteriorDesignerInput>(key: K, value: InteriorDesignerInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const copy =
    language === "ar"
      ? {
          title: "مصمم الديكور الداخلي الذكي",
          subtitle: "أجب عن بعض الأسئلة وسنقترح مفهوماً مبدئياً مستوحى من مكتبة نكسفورم.",
          steps: ["الأساسيات", "الميزانية والأسلوب", "الاحتياجات", "النتيجة"],
          roomType: "نوع الغرفة",
          dimensions: "الأبعاد (متر)",
          length: "الطول",
          width: "العرض",
          ceilingHeight: "ارتفاع السقف (متر)",
          doors: "مواقع الأبواب",
          windows: "مواقع النوافذ",
          budgetMin: "الحد الأدنى للميزانية (د.ك)",
          budgetMax: "الحد الأقصى للميزانية (د.ك)",
          style: "الأسلوب المفضل",
          colors: "الألوان المفضلة",
          lighting: "تفضيلات الإضاءة",
          furniture: "متطلبات الأثاث",
          family: "متطلبات العائلة",
          children: "متطلبات الأطفال",
          accessibility: "متطلبات إمكانية الوصول",
          notes: "ملاحظات إضافية",
          next: "التالي",
          back: "السابق",
          generate: "إنشاء المفهوم",
          generating: "جارٍ الإنشاء…",
          notConfigured: "المساعد الذكي غير مُفعّل بعد. تم حفظ طلبك ويمكنك المتابعة لاحقاً أو طلب عرض سعر مباشرة.",
          inspiration: "إلهام من معرض نكسفورم",
          cta: "حوّل هذا المفهوم إلى تصميم هندسي احترافي",
          requestQuote: "طلب عرض سعر",
        }
      : {
          title: "AI Interior Designer",
          subtitle: "Answer a few questions and we'll suggest a concept direction, grounded in NEXFORM's real gallery.",
          steps: ["Basics", "Budget & Style", "Needs", "Result"],
          roomType: "Room type",
          dimensions: "Dimensions (meters)",
          length: "Length",
          width: "Width",
          ceilingHeight: "Ceiling height (m)",
          doors: "Door locations",
          windows: "Window locations",
          budgetMin: "Budget minimum (KWD)",
          budgetMax: "Budget maximum (KWD)",
          style: "Preferred style",
          colors: "Color preferences",
          lighting: "Lighting preferences",
          furniture: "Furniture requirements",
          family: "Family requirements",
          children: "Children requirements",
          accessibility: "Accessibility requirements",
          notes: "Special notes",
          next: "Next",
          back: "Back",
          generate: "Generate Concept",
          generating: "Generating…",
          notConfigured: "The AI assistant isn't configured yet. Your request was saved — you can request a quote directly.",
          inspiration: "Inspiration from the NEXFORM gallery",
          cta: "Transform this concept into a professional engineering design.",
          requestQuote: "Request a Quote",
        };

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateInteriorConceptAction({ ...(form as InteriorDesignerInput), roomType: form.roomType!, language });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setResult(res.data);
      setStep(3);

      const matchRes = await matchCompaniesAction({ budgetMin: form.budgetMin, budgetMax: form.budgetMax, language });
      if (matchRes.success) {
        setCompanies(matchRes.data.companies);
        setCompaniesNarrative(matchRes.data.narrative);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>

      <div className="mt-6 flex gap-1.5">
        {copy.steps.map((label, i) => (
          <div key={label} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label>{copy.roomType}</Label>
              <select className={selectClass} value={form.roomType} onChange={(e) => set("roomType", e.target.value)}>
                {ROOM_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.length}</Label>
                <Input type="number" onChange={(e) => set("dimensions", { ...form.dimensions, length: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div className="space-y-2">
                <Label>{copy.width}</Label>
                <Input type="number" onChange={(e) => set("dimensions", { ...form.dimensions, width: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{copy.ceilingHeight}</Label>
              <Input type="number" onChange={(e) => set("ceilingHeight", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.doors}</Label>
              <Input onChange={(e) => set("doorLocations", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.windows}</Label>
              <Input onChange={(e) => set("windowLocations", e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.budgetMin}</Label>
                <Input type="number" onChange={(e) => set("budgetMin", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>{copy.budgetMax}</Label>
                <Input type="number" onChange={(e) => set("budgetMax", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{copy.style}</Label>
              <Input onChange={(e) => set("preferredStyle", e.target.value)} placeholder="Modern, Minimal, Luxury…" />
            </div>
            <div className="space-y-2">
              <Label>{copy.colors}</Label>
              <Input onChange={(e) => set("colorPreferences", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.lighting}</Label>
              <Input onChange={(e) => set("lightingPreferences", e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label>{copy.furniture}</Label>
              <Textarea rows={2} onChange={(e) => set("furnitureRequirements", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.family}</Label>
              <Textarea rows={2} onChange={(e) => set("familyRequirements", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.children}</Label>
              <Textarea rows={2} onChange={(e) => set("childrenRequirements", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.accessibility}</Label>
              <Textarea rows={2} onChange={(e) => set("accessibilityRequirements", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy.notes}</Label>
              <Textarea rows={2} onChange={(e) => set("specialNotes", e.target.value)} />
            </div>
          </>
        )}

        {step === 3 && result && (
          <div className="space-y-5">
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
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
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

      {step < 3 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="size-4" />
            {copy.back}
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              {copy.next}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {isPending ? copy.generating : copy.generate}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
