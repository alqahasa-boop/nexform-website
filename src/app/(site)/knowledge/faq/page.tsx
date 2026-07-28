import type { Metadata } from "next";
import { FaqContent } from "@/components/pages/faq-content";
import { listFaqItems } from "@/features/faq/faq.repository";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions NEXFORM clients ask most often.",
};

export const revalidate = 60;

export default async function FaqPage() {
  const [en, ar] = await Promise.all([listFaqItems("en", true), listFaqItems("ar", true)]);

  const toItem = (f: (typeof en)[number]) => ({ question: f.question, answer: f.answer });

  return <FaqContent faqItems={{ en: en.map(toItem), ar: ar.map(toItem) }} />;
}
