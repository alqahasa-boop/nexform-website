"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";

export interface AdminLoginState {
  error?: string;
}

export async function adminLoginAction(
  _prevState: AdminLoginState | undefined,
  formData: FormData
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "invalid_credentials" };
  }

  try {
    // Throws NEXT_REDIRECT on success — must NOT be swallowed below.
    await signIn("credentials", { email, password, redirectTo: "/admin" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalid_credentials" };
    }
    throw error;
  }
}
