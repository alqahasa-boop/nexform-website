import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const GUEST_SESSION_COOKIE = "nexform_ai_guest";
const GUEST_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Ephemeral identity for anonymous visitors using AI features — not a login,
 * just enough continuity to keep a conversation attached to the same browser.
 * Registered users get a real, persistent `AiUserWorkspace` instead (see
 * schema-level note on `AiConversation.guestSessionId`).
 */
export async function getOrCreateGuestSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(GUEST_SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GUEST_SESSION_MAX_AGE,
    path: "/",
  });
  return id;
}

export async function getGuestSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_SESSION_COOKIE)?.value ?? null;
}
