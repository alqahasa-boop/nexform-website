import { db } from "@/lib/db";
import type { MessageStatus } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type { CreateContactMessageInput, UpdateContactMessageInput } from "./types";

export function listContactMessages(
  params: PaginationParams & { status?: MessageStatus; isRead?: boolean; search?: string } = {}
) {
  const where = {
    ...(params.status && { status: params.status }),
    ...(params.isRead !== undefined && { isRead: params.isRead }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
        { message: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
    deletedAt: null,
  };

  return db.$transaction(async (tx) => {
    const total = await tx.contactMessage.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.contactMessage.findMany({
      where,
      skip,
      take,
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

export function getContactMessageById(id: string) {
  return db.contactMessage.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      replies: { include: { repliedBy: { select: { name: true, email: true } } }, orderBy: { sentAt: "asc" } },
    },
  });
}

export function createContactMessage(input: CreateContactMessageInput) {
  return db.contactMessage.create({ data: input });
}

export function updateContactMessage(id: string, input: UpdateContactMessageInput) {
  return db.contactMessage.update({ where: { id }, data: input });
}

export function replyToContactMessage(contactMessageId: string, repliedById: string, body: string) {
  return db.$transaction([
    db.contactMessageReply.create({ data: { contactMessageId, repliedById, body } }),
    db.contactMessage.update({ where: { id: contactMessageId }, data: { status: "IN_PROGRESS", isRead: true } }),
  ]);
}

export function archiveContactMessage(id: string) {
  return db.contactMessage.update({ where: { id }, data: { status: "ARCHIVED" } });
}

export function deleteContactMessage(id: string) {
  return db.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
}
