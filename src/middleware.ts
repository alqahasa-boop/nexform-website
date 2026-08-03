import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Route-protection foundation. Uses the edge-safe `authConfig` (no Prisma
 * adapter) so it can run in the Edge runtime. `/admin/**` and `/account/**`
 * gate on any authenticated session; `/customer/**` (the public customer
 * account area) redirects to its own sign-in page — see the `authorized()`
 * callback in `auth.config.ts` for the per-prefix logic.
 */
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/customer/:path*"],
};
