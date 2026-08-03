"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth/auth";
import { hashPassword, isPasswordStrongEnough } from "@/lib/auth/password";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { findUserByEmail, createCustomer } from "./customers.repository";
import { signupSchema } from "./types";

export interface SignupState {
  error?: string;
}

export interface CustomerLoginState {
  error?: string;
}

/**
 * Customer sign-in — same shared Credentials provider as staff (see auth.ts), just a
 * different redirect target. No 2FA step: nothing in the customer signup flow ever
 * offers to enable it, so `authorize()`'s 2FA branch never triggers for these accounts.
 */
export async function customerLoginAction(
  _prevState: CustomerLoginState | undefined,
  formData: FormData
): Promise<CustomerLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "invalid_credentials" };
  }

  try {
    // Throws NEXT_REDIRECT on success — must NOT be swallowed below.
    await signIn("credentials", { email, password, redirectTo: "/customer/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalid_credentials" };
    throw error;
  }
}

/**
 * Public self-service signup for the customer account area. Creates the user,
 * then immediately signs them in via the same Credentials provider staff use
 * (one shared `authorize()` — see auth.ts) so there's no separate login-after-signup
 * step and no duplicated auth logic.
 */
export async function signupAction(_prevState: SignupState | undefined, formData: FormData): Promise<SignupState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name || !email || !password) {
    return { error: "invalid_input" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit({ key: `signup:${ip}`, ...RATE_LIMIT_PRESETS.signup });
  if (!allowed) return { error: "too_many_attempts" };

  const parsed = signupSchema.safeParse({ name, email, password });
  if (!parsed.success) return { error: "invalid_input" };

  if (!isPasswordStrongEnough(parsed.data.password)) return { error: "weak_password" };

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) return { error: "email_taken" };

  const passwordHash = await hashPassword(parsed.data.password);
  await createCustomer({ name: parsed.data.name, email: parsed.data.email, passwordHash });

  try {
    // Throws NEXT_REDIRECT on success — must NOT be swallowed below.
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/customer/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "signup_succeeded_login_failed" };
    throw error;
  }
}

export async function customerLogoutAction() {
  await signOut({ redirectTo: "/" });
}
