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
      const { pathname, origin } = request.nextUrl;
      // /admin/login and /admin/reset-password must stay reachable while logged out —
      // otherwise the redirect-to-signIn below sends an unauthenticated visitor straight
      // back into this same check (a redirect loop for login, a dead end for reset).
      const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/reset-password";
      const isProtectedAdminRoute =
        (pathname.startsWith("/admin") || pathname.startsWith("/account")) && !isPublicAdminRoute;
      if (isProtectedAdminRoute && !isLoggedIn) return false; // falls back to pages.signIn ("/admin/login")

      // Customer account area lives under a separate prefix with its own sign-in page —
      // `pages.signIn` above only supports one global target, so this branch returns an
      // explicit redirect Response instead of `false` to send customers to the right page.
      const isPublicCustomerRoute =
        pathname === "/customer/login" || pathname === "/customer/signup" || pathname === "/customer/forgot-password";
      const isProtectedCustomerRoute = pathname.startsWith("/customer") && !isPublicCustomerRoute;
      if (isProtectedCustomerRoute && !isLoggedIn) {
        return Response.redirect(new URL("/customer/login", origin));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
