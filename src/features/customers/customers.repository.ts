import { db } from "@/lib/db";

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email }, select: { id: true } });
}

/** Creates a new self-service customer account: a `User` row tagged with the CUSTOMER role, plus an empty `CustomerProfile`. */
export async function createCustomer(input: { name: string; email: string; passwordHash: string }) {
  const customerRole = await db.role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });

  return db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      roles: { create: { roleId: customerRole.id } },
      customerProfile: { create: {} },
    },
  });
}

export function getCustomerAccount(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true, customerProfile: true },
  });
}
