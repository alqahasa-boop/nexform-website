import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { CustomerSignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create Account" };

export default async function CustomerSignupPage() {
  const session = await getCustomerSession();
  if (session) redirect("/customer/dashboard");

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 pb-16 pt-28 sm:pt-32">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <CustomerSignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gold">
            ← NEXFORM
          </Link>
        </p>
      </div>
    </div>
  );
}
