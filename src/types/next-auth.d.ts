import type { SystemRoleKey } from "@/generated/prisma/client";
import type { PermissionKey } from "@/config/permissions.config";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleKeys: SystemRoleKey[];
      permissions: PermissionKey[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleKeys?: SystemRoleKey[];
    permissions?: PermissionKey[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    roleKeys?: SystemRoleKey[];
    permissions?: PermissionKey[];
  }
}
