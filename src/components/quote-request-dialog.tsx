"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createDesignRequestAction } from "@/features/design-requests/design-requests.actions";
import { useLanguage } from "@/components/language-provider";

export interface QuoteRequestPrefill {
  notes?: string;
  serviceId?: string;
}

/**
 * The real handoff point from any "connect with an engineering office" moment
 * (AI chat, search results, or a direct link) into NEXFORM's existing
 * DesignRequest workflow — not a decorative button, an actual submission that
 * shows up in /admin/design-requests immediately.
 */
export function QuoteRequestDialog({
  trigger,
  prefill,
}: {
  trigger: React.ReactElement;
  prefill?: QuoteRequestPrefill;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState(prefill?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  const copy =
    language === "ar"
      ? {
          title: "طلب عرض سعر",
          subtitle: "شارك تفاصيلك وسيتواصل معك أحد مكاتبنا الهندسية الشريكة.",
          name: "الاسم الكامل",
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف",
          notes: "تفاصيل إضافية",
          submit: "إرسال الطلب",
          successTitle: "تم استلام طلبك",
          successBody: (n: string) => `رقم الطلب: ${n}. سيتواصل معك فريقنا قريباً.`,
          close: "إغلاق",
        }
      : {
          title: "Request a Quote",
          subtitle: "Share your details and one of NEXFORM's partner engineering offices will reach out.",
          name: "Full Name",
          email: "Email",
          phone: "Phone",
          notes: "Additional Details",
          submit: "Send Request",
          successTitle: "Request received",
          successBody: (n: string) => `Request number: ${n}. Our team will be in touch shortly.`,
          close: "Close",
        };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createDesignRequestAction({
        fullName,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
        serviceId: prefill?.serviceId,
      });
      if (result.success) {
        setSubmitted(result.data.requestNumber);
        toast.success(copy.successTitle);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSubmitted(null);
      }}
    >
      <DialogTrigger render={trigger} nativeButton={true} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-primary" />
            <p className="font-medium">{copy.successTitle}</p>
            <p className="text-sm text-muted-foreground">{copy.successBody(submitted)}</p>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              {copy.close}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
            <div className="space-y-2">
              <Label htmlFor="qr-name">{copy.name}</Label>
              <Input id="qr-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-email">{copy.email}</Label>
              <Input id="qr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-phone">{copy.phone}</Label>
              <Input id="qr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-notes">{copy.notes}</Label>
              <Textarea id="qr-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={handleSubmit} disabled={isPending || !fullName || !email} className="w-full">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {copy.submit}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
