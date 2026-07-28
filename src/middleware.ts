import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Route-protection foundation. Uses the edge-safe `authConfig` (no Prisma
 * adapter) so it can run in the Edge runtime. The matcher only covers
 * `/admin/**` and `/account/**` — neither exists as a page yet, so this has
 * zero effect on the current site until Phase 2 adds those routes.
 */
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
