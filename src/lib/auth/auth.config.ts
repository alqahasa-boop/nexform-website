import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the auth config — no Prisma adapter, no bcrypt, no
 * provider that touches the database. This is what `src/middleware.ts` uses
 * to gate routes without needing the Node.js runtime. The full config (with
 * the Credentials provider + Prisma adapter) lives in `auth.ts` and is used
 * everywhere the Node runtime is guaranteed (Server Components, Route Handlers).
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
    verifyRequest: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      // /admin/login and /admin/reset-password must stay reachable while logged out —
      // otherwise the redirect-to-signIn below sends an unauthenticated visitor straight
      // back into this same check (a redirect loop for login, a dead end for reset).
      const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/reset-password";
      const isProtectedRoute =
        (pathname.startsWith("/admin") || pathname.startsWith("/account")) && !isPublicAdminRoute;
      if (isProtectedRoute && !isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
