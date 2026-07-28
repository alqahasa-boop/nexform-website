import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { verifyPassword } from "./password";
import { loadUserPermissions } from "./load-permissions";
import { authConfig } from "./auth.config";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { recordActivity } from "@/features/activity-logs/activity-logs.repository";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Every failure path returns null identically — never reveal *why* a login failed.
      authorize: async (credentials, request) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const { allowed } = rateLimit({ key: `login:${ip}`, ...RATE_LIMIT_PRESETS.login });
        if (!allowed) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) return null;
        if (!user.isActive) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          const failedLoginAttempts = user.failedLoginAttempts + 1;
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts,
              ...(failedLoginAttempts >= MAX_FAILED_ATTEMPTS && {
                lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
              }),
            },
          });
          await recordActivity({
            action: "LOGIN_FAILED",
            entityType: "User",
            entityId: user.id,
            ipAddress: ip,
          });
          return null;
        }

        await db.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        await recordActivity({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id, ipAddress: ip });

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        const authUser = await loadUserPermissions(user.id);
        if (authUser) {
          token.roleKeys = authUser.roleKeys;
          token.permissions = authUser.permissions;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roleKeys = token.roleKeys ?? [];
        session.user.permissions = token.permissions ?? [];
      }
      return session;
    },
  },
});
