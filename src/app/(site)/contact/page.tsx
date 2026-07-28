import type { Metadata } from "next";
import { ContactContent } from "@/components/pages/contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NEXFORM to talk about your next architectural project.",
};

export default function ContactPage() {
  return <ContactContent />;
}
