"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export interface AdminLoginState {
  error?: string;
  requiresTwoFactor?: boolean;
}

/**
 * UX-only pre-check so the login form knows whether to show the authenticator-code field
 * before the real submission. Does NOT touch failedLoginAttempts/activity logs — that
 * bookkeeping stays solely in `authorize()` (in auth.ts) to avoid double-counting.
 */
export async function checkTwoFactorRequiredAction(email: string, password: string): Promise<AdminLoginState> {
  if (!email || !password) return { error: "invalid_credentials" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit({ key: `login:${ip}`, ...RATE_LIMIT_PRESETS.login });
  if (!allowed) return { error: "invalid_credentials" };

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !user.isActive) return { error: "invalid_credentials" };
  if (user.lockedUntil && user.lockedUntil > new Date()) return { error: "invalid_credentials" };

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return { error: "invalid_credentials" };

  return { requiresTwoFactor: user.twoFactorEnabled };
}

export async function adminLoginAction(
  _prevState: AdminLoginState | undefined,
  formData: FormData
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const code = formData.get("code");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "invalid_credentials" };
  }

  try {
    // Throws NEXT_REDIRECT on success — must NOT be swallowed below.
    await signIn("credentials", {
      email,
      password,
      ...(typeof code === "string" && code && { code }),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalid_credentials" };
    }
    throw error;
  }
}
