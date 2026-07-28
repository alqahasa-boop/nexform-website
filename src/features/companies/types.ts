import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  whatsapp: z.string().max(40).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  workingHours: z.record(z.string(), z.unknown()).optional(),
  socialLinks: z.record(z.string(), z.unknown()).optional(),
  logoId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  createdById: z.string().uuid(),
});
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial().omit({ createdById: true }).extend({
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED"]).optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  listingPackageId: z.string().uuid().nullable().optional(),
  packageExpiresAt: z.coerce.date().nullable().optional(),
});
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
