import { db } from "@/lib/db";
import type {
  AssignCreativeToPlacementInput,
  CreateCampaignInput,
  CreateCreativeInput,
  CreatePackageInput,
  CreatePlacementInput,
  UpdateCampaignInput,
} from "./types";

export function listPlacements() {
  return db.advertisementPlacement.findMany({ orderBy: { name: "asc" } });
}

export function createPlacement(input: CreatePlacementInput) {
  return db.advertisementPlacement.create({ data: input });
}

export function listPackages() {
  return db.advertisementPackage.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export function createPackage(input: CreatePackageInput) {
  return db.advertisementPackage.create({ data: input });
}

/**
 * What the homepage/ad-slot renderer calls: active-campaign creatives booked
 * into a placement, within their campaign's date window.
 */
export function listActiveAdsForPlacement(placementKey: string) {
  const now = new Date();
  return db.advertisementCampaignPlacement.findMany({
    where: {
      placement: { key: placementKey },
      campaign: {
        status: "ACTIVE",
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
    },
    include: { creative: { include: { image: true } }, campaign: { include: { company: true } } },
    orderBy: [{ campaign: { priority: "desc" } }, { campaign: { createdAt: "desc" } }],
  });
}

export function listCampaigns(companyId?: string) {
  return db.advertisementCampaign.findMany({
    where: companyId ? { companyId } : undefined,
    include: { company: true, package: true, creatives: true },
    orderBy: { createdAt: "desc" },
  });
}

export function createCampaign(input: CreateCampaignInput) {
  return db.advertisementCampaign.create({ data: input });
}

export function updateCampaign(id: string, input: UpdateCampaignInput) {
  return db.advertisementCampaign.update({ where: { id }, data: input });
}

export function submitCampaignForApproval(id: string) {
  return db.advertisementCampaign.update({ where: { id }, data: { status: "PENDING_APPROVAL" } });
}

export function approveCampaign(id: string, approvedById: string) {
  return db.advertisementCampaign.update({
    where: { id },
    data: { status: "APPROVED", approvedById, approvedAt: new Date(), rejectionReason: null },
  });
}

export function rejectCampaign(id: string, rejectionReason: string) {
  return db.advertisementCampaign.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason },
  });
}

export function deleteCampaign(id: string) {
  return db.advertisementCampaign.delete({ where: { id } });
}

export function createCreative(input: CreateCreativeInput) {
  return db.advertisementCreative.create({ data: input });
}

export function assignCreativeToPlacement(input: AssignCreativeToPlacementInput) {
  return db.advertisementCampaignPlacement.create({ data: input });
}

export function recordAdImpression(creativeId: string) {
  return db.advertisementCreative.update({
    where: { id: creativeId },
    data: { impressionCount: { increment: 1 } },
  });
}

export function recordAdClick(creativeId: string) {
  return db.advertisementCreative.update({ where: { id: creativeId }, data: { clickCount: { increment: 1 } } });
}
