import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateUserInput, UpdateUserInput } from "./types";

export function listUsers(params: PaginationParams & { roleId?: string; search?: string } = {}) {
  const where = {
    deletedAt: null,
    ...(params.roleId && { roles: { some: { roleId: params.roleId } } }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.user.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.user.findMany({
      where,
      skip,
      take,
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

export function getUserById(id: string) {
  return db.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
}

export function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(input: CreateUserInput) {
  return db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.password ? await hashPassword(input.password) : undefined,
      ...(input.roleIds && { roles: { create: input.roleIds.map((roleId) => ({ roleId })) } }),
    },
  });
}

export function updateUser(id: string, input: UpdateUserInput) {
  const { roleIds, ...rest } = input;
  return db.user.update({
    where: { id },
    data: {
      ...rest,
      ...(roleIds && {
        roles: { deleteMany: {}, create: roleIds.map((roleId) => ({ roleId })) },
      }),
    },
  });
}

export function deactivateUser(id: string) {
  return db.user.update({ where: { id }, data: { isActive: false } });
}

export function reactivateUser(id: string) {
  return db.user.update({ where: { id }, data: { isActive: true, failedLoginAttempts: 0, lockedUntil: null } });
}

export function deleteUser(id: string) {
  return db.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
}

export async function updateUserPassword(id: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return db.user.update({ where: { id }, data: { passwordHash } });
}

export function revokeUserSessions(id: string) {
  return db.session.deleteMany({ where: { userId: id } });
}

/** How many active (non-deleted) users currently hold the Super Admin role. */
export function countSuperAdmins() {
  return db.userRole.count({ where: { role: { key: "SUPER_ADMIN" }, user: { deletedAt: null } } });
}

export async function userHasRole(userId: string, roleKey: Parameters<typeof db.role.findUnique>[0]["where"]["key"]) {
  const count = await db.userRole.count({ where: { userId, role: { key: roleKey } } });
  return count > 0;
}
