import { db } from "@/lib/db";
import type { DesignRequestStatus, Prisma } from "@/generated/prisma/client";
import { buildPagination, type PaginationParams } from "@/types/api";
import type {
  AddDesignRequestMessageInput,
  CreateDesignRequestInput,
  UpdateDesignRequestInput,
} from "./types";

/** `DR-<year>-<6 random hex chars>` — human-readable, not a guessable sequence. */
function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `DR-${year}-${suffix}`;
}

export function listDesignRequests(
  params: PaginationParams & { status?: DesignRequestStatus; assignedToId?: string; search?: string } = {}
) {
  const where = {
    ...(params.status && { status: params.status }),
    ...(params.assignedToId && { assignedToId: params.assignedToId }),
    ...(params.search && {
      OR: [
        { fullName: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
        { requestNumber: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  return db.$transaction(async (tx) => {
    const total = await tx.designRequest.count({ where });
    const { skip, take, meta } = buildPagination(total, params);
    const items = await tx.designRequest.findMany({
      where,
      skip,
      take,
      include: { assignedTo: { select: { id: true, name: true } }, service: true },
      orderBy: { createdAt: "desc" },
    });
    return { items, ...meta };
  });
}

/** A signed-in customer's own submitted requests, for their account dashboard. */
export function listDesignRequestsByCustomer(customerId: string) {
  return db.designRequest.findMany({
    where: { customerId, deletedAt: null },
    include: { service: true, assignedTo: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getDesignRequestById(id: string) {
  return db.designRequest.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      service: true,
      preferredStyles: { include: { style: true } },
      images: { include: { mediaAsset: true }, orderBy: { order: "asc" } },
      messages: { orderBy: { createdAt: "asc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createDesignRequest(input: CreateDesignRequestInput) {
  const { preferredStyleIds, measurements, ...rest } = input;

  const designRequest = await db.designRequest.create({
    data: {
      ...rest,
      requestNumber: generateRequestNumber(),
      ...(measurements && { measurements: measurements as Prisma.InputJsonValue }),
      ...(preferredStyleIds && { preferredStyles: { create: preferredStyleIds.map((styleId) => ({ styleId })) } }),
    },
  });

  await db.designRequestStatusHistory.create({
    data: { designRequestId: designRequest.id, toStatus: "NEW" },
  });

  return designRequest;
}

/** Status changes are appended to `DesignRequestStatusHistory`, never overwritten. */
export async function updateDesignRequestStatus(
  id: string,
  toStatus: DesignRequestStatus,
  changedById?: string,
  note?: string
) {
  const current = await db.designRequest.findUniqueOrThrow({ where: { id }, select: { status: true } });

  return db.$transaction([
    db.designRequest.update({
      where: { id },
      data: {
        status: toStatus,
        ...(toStatus === "DELIVERED" && { deliveredAt: new Date() }),
        ...(toStatus === "COMPLETED" && { completedAt: new Date() }),
      },
    }),
    db.designRequestStatusHistory.create({
      data: { designRequestId: id, fromStatus: current.status, toStatus, changedById, note },
    }),
  ]);
}

/** Status changes go through `updateDesignRequestStatus` instead, so `status` is dropped here. */
export function updateDesignRequest(id: string, input: Omit<UpdateDesignRequestInput, "status">) {
  return db.designRequest.update({ where: { id }, data: input });
}

export function addDesignRequestMessage(input: AddDesignRequestMessageInput) {
  return db.designRequestMessage.create({ data: input });
}

export function deleteDesignRequest(id: string) {
  return db.designRequest.delete({ where: { id } });
}
